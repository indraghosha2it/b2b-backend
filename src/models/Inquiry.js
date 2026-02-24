const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  fileType: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const inquiryItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  color: {
    code: String,
    name: String
  },
  sizeQuantities: {
    type: Map,
    of: Number
  },
  totalQuantity: Number,
  unitPrice: Number,
  moq: Number,
  productImage: String
});

const inquirySchema = new mongoose.Schema({
  inquiryNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userDetails: {
    companyName: String,
    contactPerson: String,
    email: String,
    phone: String,
    whatsapp: String,
    country: String,
    address: String,
    city: String,
    zipCode: String
  },
  items: [inquiryItemSchema],
  specialInstructions: String,
  attachments: [attachmentSchema],
  totalItems: Number,
  totalQuantity: Number,
  subtotal: Number,
  status: {
    type: String,
    enum: ['submitted', 'quoted', 'invoiced', 'paid', 'cancelled'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Fix the pre-save hook - remove 'next' and use async function properly
inquirySchema.pre('save', async function() {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Inquiry').countDocuments();
    this.inquiryNumber = `INQ-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Inquiry', inquirySchema);