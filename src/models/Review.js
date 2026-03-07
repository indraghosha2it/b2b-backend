const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Rating (1-5)
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },

  // Review title (optional)
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  // Review comment
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [500, 'Review cannot exceed 500 characters']
  },

  // Product being reviewed (optional)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },

  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Display name (for anonymous or actual name)
  userName: {
    type: String,
    required: true,
    trim: true
  },

  // Company name (if not anonymous)
  userCompany: {
    type: String,
    trim: true
  },

  // User email (for contact)
  userEmail: {
    type: String,
    required: true
  },

  // Is anonymous?
  isAnonymous: {
    type: Boolean,
    default: false
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNote: String,

  // Helpful counts
  helpfulCount: {
    type: Number,
    default: 0
  },

  // Users who marked this review as helpful
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Admin can feature reviews
  isFeatured: {
    type: Boolean,
    default: false
  },
   lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastEditedAt: {
    type: Date
  },


  // Response from seller/admin (optional)
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isFeatured: 1 });

// Ensure one review per user per product (if product is selected)
reviewSchema.index({ user: 1, product: 1 }, { 
  unique: true, 
  partialFilterExpression: { product: { $type: "objectId" } } 
});

// Virtual for average rating calculation
reviewSchema.statics.getAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: { 
        product: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);