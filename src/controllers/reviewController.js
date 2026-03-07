const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (All authenticated users)
const createReview = async (req, res) => {
  try {
    const {
      rating,
      title,
      comment,
      productId,
      isAnonymous
    } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Review must be at least 10 characters long'
      });
    }

    // Get user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // If product ID provided, check if product exists
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        user: req.user.id,
        product: productId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this product'
        });
      }
    }

    // Prepare user display name
    const userName = isAnonymous 
      ? 'Anonymous Buyer' 
      : user.contactPerson || user.companyName || user.email.split('@')[0];

    // Create review
    const review = await Review.create({
      rating,
      title: title || '',
      comment,
      product: productId || null,
      user: req.user.id,
      userName,
      userCompany: isAnonymous ? null : user.companyName,
      userEmail: user.email,
      isAnonymous: isAnonymous || false,
      status: 'pending' // All reviews start as pending
    });

    // Populate user and product data for response
    await review.populate([
      { path: 'user', select: 'companyName contactPerson email' },
      { path: 'product', select: 'productName images' }
    ]);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully. It will be published after moderation.'
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating review'
    });
  }
};

// @desc    Get all reviews (with filters)
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      product,
      user,
      status,
      rating,
      isFeatured,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Check if user is authenticated and has admin/moderator role
    const isAdminOrModerator = req.user && (req.user.role === 'admin' || req.user.role === 'moderator');
    
    console.log('User role:', req.user?.role);
    console.log('Is admin/moderator:', isAdminOrModerator);
    console.log('Status filter from query:', status);
    
    if (!isAdminOrModerator) {
      // Public users only see approved reviews
      query.status = 'approved';
      console.log('Public user - forcing status=approved');
    } else {
      // Admin/moderator can see all reviews based on status filter
      if (status) {
        query.status = status;
        console.log('Admin/moderator with status filter:', status);
      } else {
        // If no status filter, show ALL reviews (pending, approved, rejected)
        // Don't add any status to query
        console.log('Admin/moderator - showing ALL reviews (no status filter)');
      }
    }

    // Filter by product
    if (product) {
      query.product = product;
    }

    // Filter by user (for admin or user themselves)
    if (user) {
      // Only allow users to see their own reviews, or admin to see any
      if (req.user && (req.user.id === user || isAdminOrModerator)) {
        query.user = user;
      }
    }

    // Filter by rating
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Filter featured
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    console.log('Final query:', JSON.stringify(query));

    // Parse sort
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1 };
        break;
      case 'helpful':
        sortOption = { helpfulCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('user', 'companyName contactPerson email')
      .populate('product', 'productName images slug')
      .populate('moderatedBy', 'contactPerson email')
      .populate('response.respondedBy', 'contactPerson email')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments(query);

    console.log(`Found ${reviews.length} reviews out of ${total} total`);

    // Calculate average rating if product filter is applied
    let averageRating = null;
    if (product) {
      const avgData = await Review.getAverageRating(product);
      averageRating = avgData.averageRating;
    }

    res.json({
      success: true,
      data: reviews,
      averageRating,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching reviews'
    });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'companyName contactPerson email')
      .populate('product', 'productName images slug')
      .populate('moderatedBy', 'contactPerson email')
      .populate('response.respondedBy', 'contactPerson email');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // If review is not approved, only show to owner or admin/moderator
    if (review.status !== 'approved') {
      if (!req.user || 
          (req.user.id !== review.user._id.toString() && 
           req.user.role !== 'admin' && 
           req.user.role !== 'moderator')) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this review'
        });
      }
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching review'
    });
  }
};

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private (Owner only)
// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Owner can update only pending, Admin/Moderator can update any)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user is admin or moderator
    const isAdminOrModerator = req.user.role === 'admin' || req.user.role === 'moderator';
    
    // Check if user owns this review
    const isOwner = review.user.toString() === req.user.id;

    // Authorization check
    if (!isOwner && !isAdminOrModerator) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this review'
      });
    }

    // If user is owner (not admin/moderator), enforce pending status restriction
    if (isOwner && !isAdminOrModerator && review.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `You can only update reviews that are in 'pending' status. This review is ${review.status}.`
      });
    }

    const {
      rating,
      title,
      comment
    } = req.body;

    // Update fields with validation
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (title !== undefined) {
      review.title = title;
    }
    
    if (comment !== undefined) {
      if (comment.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Review must be at least 10 characters long'
        });
      }
      review.comment = comment;
    }

    // If admin/moderator is updating, we might want to track who made the change
    if (isAdminOrModerator && !isOwner) {
      // Optional: Add a field to track admin edits
      review.lastEditedBy = req.user.id;
      review.lastEditedAt = new Date();
    }

    await review.save();

    // Populate for response
    await review.populate([
      { path: 'user', select: 'companyName contactPerson email' },
      { path: 'product', select: 'productName images slug' },
      { path: 'moderatedBy', select: 'contactPerson email' },
      { path: 'lastEditedBy', select: 'contactPerson email' }
    ]);

    res.json({
      success: true,
      data: review,
      message: isAdminOrModerator && !isOwner 
        ? 'Review updated by admin/moderator successfully' 
        : 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating review'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check permissions: Owner, Admin, or Moderator can delete
    if (review.user.toString() !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting review'
    });
  }
};

// @desc    Moderate review (Approve/Reject)
// @route   PUT /api/reviews/:id/moderate
// @access  Private (Admin/Moderator only)
const moderateReview = async (req, res) => {
  try {
    const { status, moderationNote } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status (approved/rejected) is required'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.status = status;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();
    if (moderationNote) review.moderationNote = moderationNote;

    await review.save();

    res.json({
      success: true,
      data: review,
      message: `Review ${status} successfully`
    });

  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while moderating review'
    });
  }
};

// @desc    Toggle featured status
// @route   PUT /api/reviews/:id/feature
// @desc    Toggle featured status (Admin/Moderator can feature)
// @route   PUT /api/reviews/:id/feature
// @access  Private (Admin/Moderator only)
const toggleFeatured = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Toggle featured status
    review.isFeatured = !review.isFeatured;
    await review.save();

    res.json({
      success: true,
      data: review,
      message: `Review ${review.isFeatured ? 'featured' : 'unfeatured'} successfully`
    });

  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling featured'
    });
  }
};

// @desc    Get featured reviews
// @route   GET /api/reviews/featured
// @access  Public
const getFeaturedReviews = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const reviews = await Review.find({ 
      status: 'approved',
      isFeatured: true 
    })
      .populate('user', 'companyName contactPerson email')
      .populate('product', 'productName images slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Get featured reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching featured reviews'
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user already marked this review as helpful
    const alreadyMarked = review.helpfulUsers.includes(req.user.id);

    if (alreadyMarked) {
      // Remove mark
      review.helpfulUsers = review.helpfulUsers.filter(
        id => id.toString() !== req.user.id
      );
      review.helpfulCount -= 1;
    } else {
      // Add mark
      review.helpfulUsers.push(req.user.id);
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({
      success: true,
      data: {
        helpfulCount: review.helpfulCount,
        isHelpful: !alreadyMarked
      }
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

// @desc    Add response to review (Admin/Moderator)
// @route   POST /api/reviews/:id/respond
// @access  Private (Admin/Moderator only)
const addResponse = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Response must be at least 5 characters long'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.response = {
      text,
      respondedBy: req.user.id,
      respondedAt: new Date()
    };

    await review.save();

    await review.populate('response.respondedBy', 'contactPerson email');

    res.json({
      success: true,
      data: review,
      message: 'Response added successfully'
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while adding response'
    });
  }
};

// @desc    Get user's own reviews
// @route   GET /api/reviews/user/me
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'productName images slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching your reviews'
    });
  }
};

// @desc    Get pending reviews count (Admin/Moderator)
// @route   GET /api/reviews/pending/count
// @access  Private (Admin/Moderator only)
const getPendingCount = async (req, res) => {
  try {
    const count = await Review.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: { pendingCount: count }
    });

  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};


module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  moderateReview,
  toggleFeatured,
  markHelpful,
  addResponse,
  getMyReviews,
  getPendingCount,
  getFeaturedReviews
};