// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Category name is required'],
//     trim: true,
//     unique: true,
//     maxlength: [100, 'Category name cannot exceed 100 characters']
//   },
//   slug: {
//     type: String,
//     lowercase: true,
//     unique: true
//   },
//   description: {
//     type: String,
//     trim: true,
//     maxlength: [500, 'Description cannot exceed 500 characters']
//   },
//   image: {
//     url: {
//       type: String,
//       required: [true, 'Category image is required']
//     },
//     publicId: {
//       type: String,
//       required: true
//     }
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// }, {
//   timestamps: true
// });

// // Create slug from name before saving - FIXED: removed 'next' parameter
// categorySchema.pre('save', function() {
//   if (this.isModified('name')) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)+/g, '');
//   }
//   // No need to call next() - just return
// });

// module.exports = mongoose.model('Category', categorySchema);


const mongoose = require('mongoose');

// Product embedded schema for category
const embeddedProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  targetedCustomer: {
    type: String,
    enum: ['ladies', 'gents', 'kids', 'unisex'],
    default: 'unisex'
  },
  fabric: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    publicId: String,
    isPrimary: Boolean
  }],
  sizes: [String],
  colors: [{
    code: String,
    name: String
  }],
  moq: Number,
  pricePerUnit: Number,
  quantityBasedPricing: [{
    range: String,
    price: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String,
      required: [true, 'Category image is required']
    },
    publicId: {
      type: String,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Embedded products array
  products: [embeddedProductSchema],
  
  // Product count for quick access
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from name before saving
categorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);