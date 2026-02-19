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

  // Status flags
  isActive: {
    type: Boolean,
    default: true
  },
  
  isApproved: {
    type: Boolean,
    default: false,
    // For moderator products waiting for admin approval
  },

  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },

  // Meta
  views: {
    type: Number,
    default: 0
  },
  
  inquiryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from product name before saving
productSchema.pre('save', function() {
  if (this.isModified('productName')) {
    this.slug = this.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

// Index for search
productSchema.index({ productName: 'text', fabric: 'text' });
productSchema.index({ category: 1, isActive: 1, isApproved: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);