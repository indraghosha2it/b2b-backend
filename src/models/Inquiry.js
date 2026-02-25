const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  fileType: {
    type: String,
    enum: ['image/png', 'image/jpeg', 'application/pdf']
  },
  fileSize: Number,
  publicId: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Schema for size quantities within a color - EXACTLY like cart
const sizeQuantitySchema = new mongoose.Schema({
  size: String,
  quantity: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Schema for color with its size quantities - EXACTLY like cart
const colorDetailSchema = new mongoose.Schema({
  color: {
    code: String,
    name: String
  },
  sizeQuantities: [sizeQuantitySchema],
  totalForColor: {
    type: Number,
    default: 0
  },
  // specialInstructions: {  // Per-color special instructions
  //   type: String,
  //   default: ''
  // }
}, { _id: false });

// Main product item schema - ONE per product with multiple colors - EXACTLY like cart
const productItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  colors: [colorDetailSchema],
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
  specialInstructions: {  // Product-level special instructions
    type: String,
    default: ''
  }
});

const internalNoteSchema = new mongoose.Schema({
  note: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const inquirySchema = new mongoose.Schema({
  inquiryNumber: {
    type: String,
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
  items: [productItemSchema], // Array of products, each with multiple colors
  specialInstructions: String, // Global inquiry-level instructions
  attachments: [attachmentSchema],
  internalNotes: [internalNoteSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalQuantity: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['submitted', 'quoted', 'accepted', 'invoiced', 'paid', 'cancelled'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Pre-save hook to generate inquiry number
inquirySchema.pre('save', async function() {
  if (this.isNew && !this.inquiryNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await mongoose.model('Inquiry').countDocuments({
      inquiryNumber: { $regex: `^INQ-${year}${month}-` }
    });
    
    this.inquiryNumber = `INQ-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Inquiry', inquirySchema);