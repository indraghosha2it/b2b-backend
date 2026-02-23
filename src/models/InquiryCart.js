const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  color: {
    code: String,
    name: String
  },
  sizeQuantities: {
    type: Map,
    of: Number,
    default: {}
  },
  totalQuantity: {
    type: Number,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true
  },
  moq: {
    type: Number,
    required: true
  },
  productImage: String
});

const inquiryCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalQuantity: {
    type: Number,
    default: 0
  },
  estimatedTotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update totals before saving
inquiryCartSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.totalQuantity = this.items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  this.estimatedTotal = this.items.reduce((sum, item) => {
    return sum + (item.totalQuantity * item.unitPrice);
  }, 0);
  next();
});

module.exports = mongoose.model('InquiryCart', inquiryCartSchema);