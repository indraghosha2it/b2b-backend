
const mongoose = require('mongoose');

// Schema for size quantities within a color
const sizeQuantitySchema = new mongoose.Schema({
  size: String,
  quantity: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Schema for color with its size quantities
const colorDetailSchema = new mongoose.Schema({
  color: {
    code: String,
    name: String
  },
  sizeQuantities: [sizeQuantitySchema], // Array of {size, quantity}
  totalForColor: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Main cart item schema - ONE per product
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
  colors: [colorDetailSchema], // Array of colors with their size quantities
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
  productImage: String,
  specialInstructions: {  // ADD THIS FIELD
    type: String,
    default: ''
  }
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
inquiryCartSchema.pre('save', function() {
  this.totalItems = this.items.length;
  this.totalQuantity = this.items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  this.estimatedTotal = this.items.reduce((sum, item) => {
    return sum + (item.totalQuantity * item.unitPrice);
  }, 0);
});

module.exports = mongoose.model('InquiryCart', inquiryCartSchema);