// const mongoose = require('mongoose');

// const pricingTierSchema = new mongoose.Schema({
//   range: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   }
// });

// const colorSchema = new mongoose.Schema({
//   code: {
//     type: String,
//     required: true,
//     match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code format']
//   },
//   name: {
//     type: String,
//     trim: true
//   }
// });


// const additionalInfoSchema = new mongoose.Schema({
//   fieldName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   fieldValue: {
//     type: String,
//     required: true,
//     trim: true
//   }
// });



// const productSchema = new mongoose.Schema({
//   // Basic Details
//   productName: {
//     type: String,
//     required: [true, 'Product name is required'],
//     trim: true,
//     maxlength: [200, 'Product name cannot exceed 200 characters']
//   },
//   slug: {
//     type: String,
//     lowercase: true,
//     unique: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//     targetedCustomer: {
//     type: String,
//     required: [true, 'Targeted customer is required'],
//     enum: {
//       values: ['ladies', 'gents', 'kids', 'unisex'],
//       message: '{VALUE} is not a valid customer type'
//     },
//     default: 'unisex'
//   },
  
//   // Category
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: [true, 'Category is required']
//   },

//   // Fabric/Material
//   fabric: {
//     type: String,
//     required: [true, 'Fabric details are required'],
//     trim: true,
//     maxlength: [100, 'Fabric details cannot exceed 100 characters']
//   },

//   // Images
//   images: [{
//     url: {
//       type: String,
//       required: true
//     },
//     publicId: {
//       type: String,
//       required: true
//     },
//     isPrimary: {
//       type: Boolean,
//       default: false
//     }
//   }],

//   // Variants
//   sizes: [{
//     type: String,
//     trim: true
//   }],
  
//   colors: [colorSchema],
//   additionalInfo: [additionalInfoSchema],

//   // Pricing
//   moq: {
//     type: Number,
//     required: [true, 'Minimum Order Quantity is required'],
//     min: [1, 'MOQ must be at least 1']
//   },
  
//   pricePerUnit: {
//     type: Number,
//     required: [true, 'Price per unit is required'],
//     min: [0, 'Price cannot be negative']
//   },

//   quantityBasedPricing: [pricingTierSchema],

//   // Status flags
//   isActive: {
//     type: Boolean,
//     default: true
//   },
  
 

//   // Tracking
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
  
 
 

//   // Meta
//   views: {
//     type: Number,
//     default: 0
//   },
  
//   inquiryCount: {
//     type: Number,
//     default: 0
//   },
//     // Reviews
//   reviews: [{
//     reviewId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Review'
//     },
//     rating: Number,
//     title: String,
//     comment: String,
//     userName: String,
//     userCompany: String,
//     createdAt: Date,
//     isFeatured: {
//       type: Boolean,
//       default: false
//     }
//   }],

//   // Review statistics
//   reviewStats: {
//     averageRating: {
//       type: Number,
//       default: 0
//     },
//     totalReviews: {
//       type: Number,
//       default: 0
//     },
//     ratingDistribution: {
//       1: { type: Number, default: 0 },
//       2: { type: Number, default: 0 },
//       3: { type: Number, default: 0 },
//       4: { type: Number, default: 0 },
//       5: { type: Number, default: 0 }
//     }
//   },

// }, {
//   timestamps: true
// });



// // Create slug from product name before saving
// productSchema.pre('save', function() {
//   if (this.isModified('productName')) {
//     this.slug = this.productName
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)+/g, '');
//   }
// });

// // Index for search
// productSchema.index({ productName: 'text', fabric: 'text' });
// productSchema.index({ category: 1, isActive: 1, isApproved: 1 });
// productSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const pricingTierSchema = new mongoose.Schema({
  range: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const colorSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code format']
  },
  name: {
    type: String,
    trim: true
  }
});

const additionalInfoSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    trim: true
  },
  fieldValue: {
    type: String,
    required: true,
    trim: true
  }
});

// Meta Settings Schema
const metaSettingsSchema = new mongoose.Schema({
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [70, 'Meta title should not exceed 70 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description should not exceed 160 characters']
  },
  metaKeywords: [{
    type: String,
    trim: true
  }]
});

const productSchema = new mongoose.Schema({
  // Basic Details
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
   instruction: {
    type: String,
    trim: true,
    default: ''
  },
  targetedCustomer: {
    type: String,
    required: [true, 'Targeted customer is required'],
    enum: {
      values: ['ladies', 'gents', 'kids', 'unisex'],
      message: '{VALUE} is not a valid customer type'
    },
    default: 'unisex'
  },
  
  // Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },

  // Fabric/Material
  fabric: {
    type: String,
    required: [true, 'Fabric details are required'],
    trim: true,
    maxlength: [100, 'Fabric details cannot exceed 100 characters']
  },

  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Variants
  sizes: [{
    type: String,
    trim: true
  }],
  
  colors: [colorSchema],
  additionalInfo: [additionalInfoSchema],

  // Pricing
  moq: {
    type: Number,
    required: [true, 'Minimum Order Quantity is required'],
    min: [1, 'MOQ must be at least 1']
  },
  
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price cannot be negative']
  },

  quantityBasedPricing: [pricingTierSchema],

  // NEW: Featured & Tags
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  tags: [{
    type: String,
    enum: {
      values: [
        'Top Ranking',
        'New Arrival',
        'Top Deal',
        'Best Seller',
        'Summer Collection',
        'Winter Collection',
        'Limited Edition',
        'Trending',
      ],
      message: '{VALUE} is not a valid tag'
    }
  }],

  // NEW: SEO Settings
  metaSettings: metaSettingsSchema,

  // Status flags
  isActive: {
    type: Boolean,
    default: true
  },

  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Meta
  views: {
    type: Number,
    default: 0
  },
  
  inquiryCount: {
    type: Number,
    default: 0
  },
  
  // Reviews
  reviews: [{
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    rating: Number,
    title: String,
    comment: String,
    userName: String,
    userCompany: String,
    createdAt: Date,
    isFeatured: {
      type: Boolean,
      default: false
    }
  }],

  // Review statistics
  reviewStats: {
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },

}, {
  timestamps: true
});

// Create slug from product name before saving - FIXED: Removed 'next' parameter to match your previous working schema
productSchema.pre('save', function() {
  if (this.isModified('productName')) {
    this.slug = this.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  
  // Initialize metaSettings as empty object if not exists
  if (!this.metaSettings) {
    this.metaSettings = {};
  }
});

// Index for search
productSchema.index({ productName: 'text', fabric: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });

module.exports = mongoose.model('Product', productSchema);