// // const mongoose = require('mongoose');

// // const invoiceItemColorSchema = new mongoose.Schema({
// //   color: {
// //     code: String,
// //     name: String
// //   },
// //   sizeQuantities: [{
// //     size: String,
// //     quantity: Number
// //   }],
// //   totalForColor: Number
// // }, { _id: false });

// // const invoiceItemSchema = new mongoose.Schema({
// //   productId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'Product',
// //     required: true
// //   },
// //   productName: String,
// //   colors: [invoiceItemColorSchema],
// //   totalQuantity: Number,
// //   unitPrice: Number,
// //   moq: Number,
// //   productImage: String,
// //   total: Number
// // }, { _id: false });

// // const customFieldSchema = new mongoose.Schema({
// //   fieldName: String,
// //   fieldValue: String
// // }, { _id: false });

// // const invoiceSchema = new mongoose.Schema({
// //   invoiceNumber: {
// //     type: String,
// //     required: true,
// //     unique: true
// //   },
// //   inquiryId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'Inquiry'
// //   },
// //   userId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User',
// //     required: true
// //   },
// //   customer: {
// //     companyName: String,
// //     contactPerson: String,
// //     email: String,
// //     phone: String,
// //     whatsapp: String,
// //     billingAddress: String,
// //     billingCity: String,
// //     billingZipCode: String,
// //     billingCountry: String,
// //     shippingAddress: String,
// //     shippingCity: String,
// //     shippingZipCode: String,
// //     shippingCountry: String
// //   },
// //   company: {
// //     logo: String,
// //     logoPublicId: String,
// //     companyName: String,
// //     contactPerson: String,
// //     email: String,
// //     phone: String,
// //     address: String
// //   },
// //   items: [invoiceItemSchema],
  
// //   // Invoice details
// //   invoiceDate: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   dueDate: Date,
  
// //   // Calculations
// //   subtotal: Number,
// //   vatPercentage: Number,
// //   vatAmount: Number,
// //   totalAfterVat: Number,
// //   discountPercentage: Number,
// //   discountAmount: Number,
// //   totalAfterDiscount: Number,
// //   shippingCost: Number,
// //   finalTotal: Number,
// //   amountPaid: {
// //     type: Number,
// //     default: 0
// //   },
// //   dueAmount: Number,
  
// //   // Status fields
// //   paymentStatus: {
// //     type: String,
// //     enum: ['paid', 'partial', 'unpaid', 'overdue'],
// //     default: 'unpaid'
// //   },
// //   status: {
// //     type: String,
// //     enum: ['paid', 'partial', 'unpaid', 'cancelled', 'overdue'],
// //     default: 'unpaid'
// //   },
  
// //   // Additional info
// //   notes: String,
// //   terms: String,
// //   customFields: [customFieldSchema],
  
// //   // Tracking
// //   createdBy: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User',
// //     required: true
// //   },
// //   createdAt: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   updatedAt: {
// //     type: Date,
// //     default: Date.now
// //   }
// // });

// // // Pre-save hook to generate invoice number
// // invoiceSchema.pre('save', async function(next) {
// //   if (this.isNew && !this.invoiceNumber) {
// //     const date = new Date();
// //     const year = date.getFullYear().toString().slice(-2);
// //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
// //     const count = await mongoose.model('Invoice').countDocuments({
// //       invoiceNumber: { $regex: `^INV-${year}${month}-` }
// //     });
    
// //     this.invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
// //   }
// //   this.updatedAt = new Date();
// //   next();
// // });

// // module.exports = mongoose.model('Invoice', invoiceSchema);



// const mongoose = require('mongoose');

// const invoiceItemColorSchema = new mongoose.Schema({
//   color: {
//     code: String,
//     name: String
//   },
//   sizeQuantities: [{
//     size: String,
//     quantity: Number
//   }],
//   totalForColor: Number
// }, { _id: false });

// const invoiceItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   productName: String,
//   colors: [invoiceItemColorSchema],
//   totalQuantity: Number,
//   unitPrice: Number,
//   moq: Number,
//   productImage: String,
//   total: Number
// }, { _id: false });

// const bankDetailsSchema = new mongoose.Schema({
//   bankName: String,
//   accountName: String,
//   accountNumber: String,
//   accountType: String,
//   routingNumber: String,
//   swiftCode: String,
//   iban: String,
//   bankAddress: String
// }, { _id: false });

// const customFieldSchema = new mongoose.Schema({
//   fieldName: String,
//   fieldValue: String
// }, { _id: false });

// const invoiceSchema = new mongoose.Schema({
//   invoiceNumber: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   inquiryId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Inquiry'
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   customer: {
//     companyName: String,
//     contactPerson: String,
//     email: String,
//     phone: String,
//     whatsapp: String,
//     billingAddress: String,
//     billingCity: String,
//     billingZipCode: String,
//     billingCountry: String,
//     shippingAddress: String,
//     shippingCity: String,
//     shippingZipCode: String,
//     shippingCountry: String
//   },
//   company: {
//     logo: String,
//     logoPublicId: String,
//     companyName: String,
//     contactPerson: String,
//     email: String,
//     phone: String,
//     address: String
//   },
//   bankDetails: bankDetailsSchema,
//   items: [invoiceItemSchema],
  
//   // Invoice details
//   invoiceDate: {
//     type: Date,
//     default: Date.now
//   },
//   dueDate: Date,
  
//   // Calculations
//   subtotal: Number,
//   vatPercentage: Number,
//   vatAmount: Number,
//   totalAfterVat: Number,
//   discountPercentage: Number,
//   discountAmount: Number,
//   totalAfterDiscount: Number,
//   shippingCost: Number,
//   finalTotal: Number,
//   amountPaid: {
//     type: Number,
//     default: 0
//   },
//   dueAmount: Number,
  
//   // Status fields
//   paymentStatus: {
//     type: String,
//     enum: ['paid', 'partial', 'unpaid', 'overdue', 'sent'],
//     default: 'unpaid'
//   },
//   status: {
//     type: String,
//     enum: ['draft', 'sent', 'paid', 'partial', 'unpaid', 'cancelled', 'overdue'],
//     default: 'draft'
//   },
  
//   // Additional info
//   notes: String,
//   terms: String,
//   customFields: [customFieldSchema],
  
//   // Tracking
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Pre-save hook to generate invoice number
// invoiceSchema.pre('save', async function(next) {
//   if (this.isNew && !this.invoiceNumber) {
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
//     const count = await mongoose.model('Invoice').countDocuments({
//       invoiceNumber: { $regex: `^INV-${year}${month}-` }
//     });
    
//     this.invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
//   }
//   this.updatedAt = new Date();
//   next();
// });

// module.exports = mongoose.model('Invoice', invoiceSchema);


const mongoose = require('mongoose');

const invoiceItemColorSchema = new mongoose.Schema({
  color: {
    code: String,
    name: String
  },
  sizeQuantities: [{
    size: String,
    quantity: Number
  }],
  totalForColor: Number
}, { _id: false });

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  colors: [invoiceItemColorSchema],
  totalQuantity: Number,
  unitPrice: Number,
  moq: Number,
  productImage: String,
  total: Number
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
  bankName: String,
  accountName: String,
  accountNumber: String,
  accountType: String,
  routingNumber: String,
  swiftCode: String,
  iban: String,
  bankAddress: String
}, { _id: false });

const customFieldSchema = new mongoose.Schema({
  fieldName: String,
  fieldValue: String
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  inquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  },
  inquiryNumber: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    companyName: String,
    contactPerson: String,
    email: String,
    phone: String,
    whatsapp: String,
    billingAddress: String,
    billingCity: String,
    billingZipCode: String,
    billingCountry: String,
    shippingAddress: String,
    shippingCity: String,
    shippingZipCode: String,
    shippingCountry: String
  },
  company: {
    logo: String,
    logoPublicId: String,
    companyName: String,
    contactPerson: String,
    email: String,
    phone: String,
    address: String
  },
  bankDetails: bankDetailsSchema,
  items: [invoiceItemSchema],
  
  // Invoice details
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  
  // Calculations
  subtotal: Number,
  vatPercentage: Number,
  vatAmount: Number,
  totalAfterVat: Number,
  discountPercentage: Number,
  discountAmount: Number,
  totalAfterDiscount: Number,
  shippingCost: Number,
  finalTotal: Number,
  amountPaid: {
    type: Number,
    default: 0
  },
  dueAmount: Number,
  
  // Status fields
  paymentStatus: {
    type: String,
    enum:  ['paid', 'partial', 'unpaid', 'overdue', 'overpaid', 'cancelled'],
    default: 'unpaid'
  },
  // status: {
  //   type: String,
  //   enum: ['draft', 'sent', 'paid', 'partial', 'unpaid', 'cancelled', 'overdue'],
  //   default: 'draft'
  // },
  
  // Additional info
  notes: String,
  terms: String,
  customFields: [customFieldSchema],
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Pre-save hook to generate invoice number - FIXED with next parameter
// Pre-save hook to generate invoice number - Alternative version without next
invoiceSchema.pre('save', async function() {
  try {
    if (this.isNew && !this.invoiceNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      const count = await mongoose.model('Invoice').countDocuments({
        invoiceNumber: { $regex: `^INV-${year}${month}-` }
      });
      
      this.invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    this.updatedAt = new Date();
  } catch (error) {
    throw error; // Mongoose will handle the error
  }
});

// Alternative without next parameter (using Promise return)
// invoiceSchema.pre('save', async function() {
//   if (this.isNew && !this.invoiceNumber) {
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     
//     const count = await mongoose.model('Invoice').countDocuments({
//       invoiceNumber: { $regex: `^INV-${year}${month}-` }
//     });
//     
//     this.invoiceNumber = `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
//   }
//   this.updatedAt = new Date();
// });

// Index for better query performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ inquiryId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);