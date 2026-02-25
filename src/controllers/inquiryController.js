const Inquiry = require('../models/Inquiry');
const InquiryCart = require('../models/InquiryCart');

// @desc    Submit inquiry from cart
// @route   POST /api/inquiry-cart/submit
// @access  Private
const submitInquiry = async (req, res) => {
  try {
    const { specialInstructions, attachments } = req.body; // Global instructions

    console.log('📝 Submitting inquiry for user:', req.user.id);

    // Get user's cart
    const cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Get user details from req.user
    const userDetails = {
      companyName: req.user.companyName || '',
      contactPerson: req.user.contactPerson || '',
      email: req.user.email || '',
      phone: req.user.phone || '',
      whatsapp: req.user.whatsapp || '',
      country: req.user.country || '',
      address: req.user.address || '',
      city: req.user.city || '',
      zipCode: req.user.zipCode || ''
    };

    // Directly use cart items - they already have the correct structure!
    // No need to flatten or transform - just copy the structure
    const inquiryItems = cart.items.map(cartItem => {
      // Create a deep copy of the cart item with the exact same structure
      return {
        productId: cartItem.productId,
        productName: cartItem.productName,
        colors: cartItem.colors.map(color => ({
          color: color.color,
          sizeQuantities: color.sizeQuantities.filter(sq => sq.quantity > 0), // Only keep non-zero quantities
          totalForColor: color.totalForColor,
          specialInstructions: color.specialInstructions || ''
        })),
        totalQuantity: cartItem.totalQuantity,
        unitPrice: cartItem.unitPrice,
        moq: cartItem.moq,
        productImage: cartItem.productImage || '',
        specialInstructions: cartItem.specialInstructions || ''
      };
    });

    console.log(`📦 Creating inquiry with ${inquiryItems.length} products`);
    console.log('📊 Products:', inquiryItems.map(item => ({
      product: item.productName,
      colors: item.colors.length,
      totalQty: item.totalQuantity
    })));

    // Create inquiry with the exact same structure as cart
    const inquiry = new Inquiry({
      userId: req.user.id,
      userDetails,
      items: inquiryItems,
      specialInstructions: specialInstructions || '',
      attachments: attachments || [],
      totalItems: inquiryItems.length,
      totalQuantity: cart.totalQuantity,
      subtotal: cart.estimatedTotal,
      status: 'submitted'
    });

    await inquiry.save();

    console.log('✅ Inquiry created successfully:', inquiry.inquiryNumber);
    console.log('📦 Saved inquiry structure:', JSON.stringify({
      inquiryNumber: inquiry.inquiryNumber,
      items: inquiry.items.map(item => ({
        product: item.productName,
        colorsCount: item.colors.length,
        colors: item.colors.map(c => ({
          color: c.color.code,
          totalForColor: c.totalForColor,
          sizeCount: c.sizeQuantities.length
        }))
      }))
    }, null, 2));

    // Clear the cart after successful submission
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: {
        inquiryId: inquiry._id,
        inquiryNumber: inquiry.inquiryNumber,
        status: inquiry.status
      },
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('❌ Submit inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error submitting inquiry'
    });
  }
};

// @desc    Get user's inquiries (Customer Dashboard)
// @route   GET /api/inquiries/my-inquiries
// @access  Private
const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Get my inquiries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiries'
    });
  }
};

// @desc    Get single inquiry by ID (Customer)
// @route   GET /api/inquiries/:id
// @access  Private
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiry'
    });
  }
};

// @desc    Cancel inquiry (Customer)
// @route   PUT /api/inquiries/:id/cancel
// @access  Private
const cancelInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    if (inquiry.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel inquiry that has already been quoted or invoiced'
      });
    }

    inquiry.status = 'cancelled';
    await inquiry.save();

    res.json({
      success: true,
      data: inquiry,
      message: 'Inquiry cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error cancelling inquiry'
    });
  }
};
// @desc    Accept quote (Customer)
// @route   PUT /api/inquiries/:id/accept
// @access  Private
const acceptQuote = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    // Check if inquiry is in quoted status
    if (inquiry.status !== 'quoted') {
      return res.status(400).json({
        success: false,
        error: 'Can only accept inquiries that are in quoted status'
      });
    }

    // Update status to accepted
    inquiry.status = 'accepted';
    await inquiry.save();

    console.log(`✅ Inquiry ${inquiry.inquiryNumber} accepted by customer ${req.user.id}`);

    res.json({
      success: true,
      data: inquiry,
      message: 'Quote accepted successfully'
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error accepting quote'
    });
  }
};

// ========== ADMIN CONTROLLERS ==========

// @desc    Get all inquiries (Admin)
// @route   GET /api/admin/inquiries
// @access  Private/Admin
const getAllInquiries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { inquiryNumber: { $regex: search, $options: 'i' } },
        { 'userDetails.companyName': { $regex: search, $options: 'i' } },
        { 'userDetails.contactPerson': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const inquiries = await Inquiry.find(filter)
      .populate('userId', 'companyName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inquiry.countDocuments(filter);

    // Get statistics
    const stats = await Inquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$subtotal' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        inquiries,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiries'
    });
  }
};

// @desc    Get single inquiry by ID (Admin)
// @route   GET /api/admin/inquiries/:id
// @access  Private/Admin
const getAdminInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('userId', 'companyName email phone role');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiry'
    });
  }
};

// @desc    Update inquiry status (Admin)
// @route   PUT /api/admin/inquiries/:id/status
// @access  Private/Admin
const updateInquiryStatus = async (req, res) => {
  try {
    const { status, internalNotes } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    const validTransitions = {
      'submitted': ['quoted', 'cancelled'],
      'quoted': ['invoiced', 'cancelled'],
      'invoiced': ['paid', 'cancelled'],
      'paid': [],
      'cancelled': []
    };

    if (!validTransitions[inquiry.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from ${inquiry.status} to ${status}`
      });
    }

    inquiry.status = status;
    
    if (internalNotes) {
      if (!inquiry.internalNotes) inquiry.internalNotes = [];
      inquiry.internalNotes.push({
        note: internalNotes,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    await inquiry.save();

    res.json({
      success: true,
      data: inquiry,
      message: `Inquiry status updated to ${status}`
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating inquiry status'
    });
  }
};

// @desc    Add internal note to inquiry (Admin/Moderator)
// @route   POST /api/admin/inquiries/:id/notes
// @access  Private/Admin/Moderator
const addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    if (!inquiry.internalNotes) inquiry.internalNotes = [];

    inquiry.internalNotes.push({
      note,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await inquiry.save();

    res.json({
      success: true,
      data: inquiry.internalNotes,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error adding note'
    });
  }
};

// @desc    Get dashboard statistics (Admin)
// @route   GET /api/admin/inquiries/stats/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalInquiries,
      pendingQuotations,
      unpaidInvoices,
      monthlyRevenue,
      recentInquiries,
      statusBreakdown
    ] = await Promise.all([
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'submitted' }),
      Inquiry.countDocuments({ status: 'invoiced' }),
      Inquiry.aggregate([
        {
          $match: {
            status: 'paid',
            updatedAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$subtotal' }
          }
        }
      ]),
      Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('inquiryNumber userDetails.companyName status subtotal createdAt'),
      Inquiry.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            value: { $sum: '$subtotal' }
          }
        }
      ])
    ]);

    const lastMonthRevenue = await Inquiry.aggregate([
      {
        $match: {
          status: 'paid',
          updatedAt: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$subtotal' }
        }
      }
    ]);

    const currentMonthTotal = monthlyRevenue[0]?.total || 0;
    const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
    
    const revenueGrowth = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalInquiries,
          pendingQuotations,
          unpaidInvoices,
          monthlyRevenue: currentMonthTotal,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100
        },
        recentInquiries,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            value: item.value
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching dashboard statistics'
    });
  }
};
// @desc    Delete inquiry (Admin)
// @route   DELETE /api/admin/inquiries/:id
// @access  Private/Admin
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    // Optional: Add protection to prevent deleting paid inquiries
    if (inquiry.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a paid inquiry'
      });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Inquiry ${inquiry.inquiryNumber} deleted by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting inquiry'
    });
  }
};

module.exports = {
  // Customer endpoints
  submitInquiry,
  getMyInquiries,
  getInquiryById,
  cancelInquiry,
  acceptQuote,
  
  // Admin endpoints
  getAllInquiries,
  getAdminInquiryById,
  updateInquiryStatus,
  addInternalNote,
  getDashboardStats,
   deleteInquiry 
};