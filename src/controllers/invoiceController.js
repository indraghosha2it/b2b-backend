


const Invoice = require('../models/Invoice');
const Inquiry = require('../models/Inquiry');
const { 
  sendInvoiceCreationEmails, 
  sendInvoiceUpdateEmails, 
  sendPaymentStatusUpdateEmails 
} = require('../utils/invoiceEmailService');

// ADD THIS HELPER FUNCTION HERE
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price || 0);
};

// Helper function to calculate payment status - REMOVED overdue
// const calculatePaymentStatus = (finalTotal, amountPaid) => {
//   const epsilon = 0.01;
//   const dueAmount = finalTotal - amountPaid;
  
//   if (Math.abs(dueAmount) < epsilon && finalTotal > 0) {
//     return 'paid';
//   }
//   if (dueAmount < -epsilon) {
//     return 'overpaid';
//   }
//   if (amountPaid > epsilon) {
//     return 'partial';
//   }
//   if (finalTotal > epsilon) {
//     return 'unpaid';
//   }
//   return 'unpaid';
// };


// @desc    Create new invoice (Admin only)
// @route   POST /api/invoices
// @access  Private/Admin

// Helper function to calculate payment status and percentages
const calculatePaymentStatus = (finalTotal, amountPaid) => {
  const epsilon = 0.01;
  const dueAmount = finalTotal - amountPaid;
  
  // Calculate percentages (using existing amountPaid and dueAmount)
  let paidPercentage = 0;
  let unpaidPercentage = 0;
  
  if (finalTotal > 0) {
    paidPercentage = (amountPaid / finalTotal) * 100;
    unpaidPercentage = (dueAmount / finalTotal) * 100;
    
    // Round to 2 decimal places
    paidPercentage = Math.round(paidPercentage * 100) / 100;
    unpaidPercentage = Math.round(unpaidPercentage * 100) / 100;
  }
  
  // Handle negative percentages for overpaid
  if (unpaidPercentage < 0) {
    unpaidPercentage = 0;
    paidPercentage = 100;
  }
  
  // Determine payment status
  let paymentStatus = 'unpaid';
  
  if (Math.abs(dueAmount) < epsilon && finalTotal > 0) {
    paymentStatus = 'paid';
  } else if (dueAmount < -epsilon) {
    paymentStatus = 'overpaid';
  } else if (amountPaid > epsilon) {
    paymentStatus = 'partial';
  } else if (finalTotal > epsilon) {
    paymentStatus = 'unpaid';
  }
  
  return {
    paymentStatus,
    paidPercentage,
    unpaidPercentage,
    dueAmount
  };
};


// const createInvoice = async (req, res) => {
//   try {
//     const invoiceData = {
//       ...req.body,
//       createdBy: req.user.id
//     };

//     // Validate required fields
//     if (!invoiceData.userId) {
//       return res.status(400).json({
//         success: false,
//         error: 'User ID is required'
//       });
//     }

//     // Calculate initial payment status (no overdue)
//     invoiceData.paymentStatus = calculatePaymentStatus(
//       invoiceData.finalTotal, 
//       invoiceData.amountPaid || 0
//     );

//     // Create the invoice
//     const invoice = await Invoice.create(invoiceData);

//     // If this invoice is from an inquiry, update the inquiry status to 'invoiced'
//     if (invoiceData.inquiryId) {
//       const inquiry = await Inquiry.findByIdAndUpdate(
//         invoiceData.inquiryId,
//         { 
//           status: 'invoiced',
//           $push: {
//             internalNotes: {
//               note: `Invoice ${invoice.invoiceNumber} created`,
//               addedBy: req.user.id,
//               addedAt: new Date()
//             }
//           }
//         },
//         { new: true }
//       );

//       if (inquiry) {
//         console.log(`✅ Inquiry ${inquiry.inquiryNumber} status updated to invoiced`);
//       }
//     }

//     res.status(201).json({
//       success: true,
//       data: invoice,
//       message: 'Invoice created successfully'
//     });
//   } catch (error) {
//     console.error('Create invoice error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error creating invoice'
//     });
//   }
// };

// @desc    Get all invoices (Admin only)
// @route   GET /api/invoices
// @access  Private/Admin

// @desc    Create new invoice (Admin only)
// @route   POST /api/invoices
// @access  Private/Admin
const createInvoice = async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Round all monetary values to 2 decimal places
    if (invoiceData.subtotal) invoiceData.subtotal = Math.round(invoiceData.subtotal * 100) / 100;
    if (invoiceData.vatAmount) invoiceData.vatAmount = Math.round(invoiceData.vatAmount * 100) / 100;
    if (invoiceData.totalAfterVat) invoiceData.totalAfterVat = Math.round(invoiceData.totalAfterVat * 100) / 100;
    if (invoiceData.discountAmount) invoiceData.discountAmount = Math.round(invoiceData.discountAmount * 100) / 100;
    if (invoiceData.totalAfterDiscount) invoiceData.totalAfterDiscount = Math.round(invoiceData.totalAfterDiscount * 100) / 100;
    if (invoiceData.shippingCost) invoiceData.shippingCost = Math.round(invoiceData.shippingCost * 100) / 100;
    if (invoiceData.finalTotal) invoiceData.finalTotal = Math.round(invoiceData.finalTotal * 100) / 100;
    if (invoiceData.amountPaid) invoiceData.amountPaid = Math.round(invoiceData.amountPaid * 100) / 100;
    if (invoiceData.dueAmount) invoiceData.dueAmount = Math.round(invoiceData.dueAmount * 100) / 100;


    // Clean up banking terms (remove empty ones)
    if (invoiceData.bankingTerms && Array.isArray(invoiceData.bankingTerms)) {
      invoiceData.bankingTerms = invoiceData.bankingTerms.filter(term => 
        term.title?.trim() !== '' || term.value?.trim() !== ''
      );
    }

    // Round items
    if (invoiceData.items) {
      invoiceData.items = invoiceData.items.map(item => {
        if (item.unitPrice) item.unitPrice = Math.round(item.unitPrice * 100) / 100;
        if (item.total) item.total = Math.round(item.total * 100) / 100;
        return item;
      });
    }

    // Validate required fields
    if (!invoiceData.userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // DO NOT DELETE THE INVOICE NUMBER - it's now coming from frontend
    // delete invoiceData.invoiceNumber;  // <-- REMOVE OR COMMENT THIS LINE

    // Calculate payment details including percentages
    const paymentDetails = calculatePaymentStatus(
      invoiceData.finalTotal, 
      invoiceData.amountPaid || 0
    );
    
    invoiceData.paymentStatus = paymentDetails.paymentStatus;
    invoiceData.paidPercentage = paymentDetails.paidPercentage;
    invoiceData.unpaidPercentage = paymentDetails.unpaidPercentage;
    invoiceData.dueAmount = paymentDetails.dueAmount;

    // Create the invoice
    const invoice = await Invoice.create(invoiceData);

    // If this invoice is from an inquiry, update the inquiry status
    if (invoiceData.inquiryId) {
      const inquiry = await Inquiry.findByIdAndUpdate(
        invoiceData.inquiryId,
        { 
          status: 'invoiced',
          $push: {
            internalNotes: {
              note: `Invoice ${invoice.invoiceNumber} created`,
              addedBy: req.user.id,
              addedAt: new Date()
            }
          }
        },
        { new: true }
      );

      if (inquiry) {
        console.log(`✅ Inquiry ${inquiry.inquiryNumber} status updated to invoiced`);
      }
    }
     // --- SEND INVOICE CREATION EMAILS ---
    try {
      const customerDetails = {
        companyName: invoice.customer.companyName,
        contactPerson: invoice.customer.contactPerson,
        email: invoice.customer.email,
        phone: invoice.customer.phone,
        whatsapp: invoice.customer.whatsapp
      };
      
      await sendInvoiceCreationEmails(invoice, customerDetails);
      console.log(`📧 Invoice creation emails sent for: ${invoice.invoiceNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send invoice creation emails:', emailError.message);
    }
    // --- END EMAILS ---

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating invoice'
    });
  }
};
// @desc    Get next invoice number
// @route   GET /api/invoices/next-number
// @access  Private/Admin
const getNextInvoiceNumber = async (req, res) => {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `INV-${year}${month}-`;
    
    // Find the latest invoice with this month's prefix
    const latestInvoice = await Invoice.findOne({
      invoiceNumber: { $regex: `^${prefix}` }
    }).sort({ invoiceNumber: -1 });
    
    let nextNumber = 1;
    
    if (latestInvoice) {
      // Extract the number part and increment
      const lastNumber = parseInt(latestInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const nextInvoiceNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    
    res.json({
      success: true,
      data: nextInvoiceNumber
    });
  } catch (error) {
    console.error('Get next invoice number error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error getting next invoice number'
    });
  }
};




// const getAllInvoices = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       paymentStatus,
//       startDate,
//       endDate,
//       search,
//       inquiryId
//     } = req.query;

//     const filter = {};

//     if (inquiryId) filter.inquiryId = inquiryId;
//     if (paymentStatus) filter.paymentStatus = paymentStatus;

//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) filter.createdAt.$lte = new Date(endDate);
//     }

//     if (search) {
//       filter.$or = [
//         { invoiceNumber: { $regex: search, $options: 'i' } },
//         { 'customer.companyName': { $regex: search, $options: 'i' } },
//         { 'customer.contactPerson': { $regex: search, $options: 'i' } },
//         { 'customer.email': { $regex: search, $options: 'i' } }
//       ];
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const invoices = await Invoice.find(filter)
//       .populate('userId', 'companyName email')
//       .populate('createdBy', 'contactPerson email')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Invoice.countDocuments(filter);

//     // Get statistics - REMOVED overdue
//     const stats = await Invoice.aggregate([
//       {
//         $group: {
//           _id: '$paymentStatus',
//           count: { $sum: 1 },
//           totalValue: { $sum: '$finalTotal' }
//         }
//       }
//     ]);

//     const totalRevenue = await Invoice.aggregate([
//       {
//         $match: {
//           paymentStatus: 'paid'
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: '$finalTotal' }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         invoices,
//         stats,
//         totalRevenue: totalRevenue[0]?.total || 0,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get invoices error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching invoices'
//     });
//   }
// };

// @desc    Get single invoice by ID (Admin & Customer)
// @route   GET /api/invoices/:id
// @access  Private

// @desc    Get all invoices (Admin only)
// @route   GET /api/invoices
// @access  Private/Admin

// @desc    Get all invoices (Admin only)
// @route   GET /api/invoices
// @access  Private/Admin
const getAllInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      paymentStatus,
      year,
      month,
      search,
      inquiryId
    } = req.query;

    const filter = {};

    if (inquiryId) filter.inquiryId = inquiryId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Apply date filter based on year/month
    if (year) {
      if (month) {
        // Filter by specific month and year
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        
        filter.invoiceDate = {
          $gte: startDate,
          $lte: endDate
        };
        console.log(`📅 Filtering by month: ${month}/${year}`, { startDate, endDate });
      } else {
        // Filter by specific year
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        
        filter.invoiceDate = {
          $gte: startDate,
          $lte: endDate
        };
        console.log(`📅 Filtering by year: ${year}`, { startDate, endDate });
      }
    }

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.companyName': { $regex: search, $options: 'i' } },
        { 'customer.contactPerson': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get paginated invoices
    const invoices = await Invoice.find(filter)
      .populate('userId', 'companyName email')
      .populate('createdBy', 'contactPerson email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    // Get ALL invoices with the same filter (for stats) - WITHOUT PAGINATION
    const allInvoices = await Invoice.find(filter);
    
    // Calculate stats from all invoices - This is what the frontend expects
    const paid = allInvoices.filter(i => i.paymentStatus === 'paid').length;
    const partial = allInvoices.filter(i => i.paymentStatus === 'partial').length;
    const unpaid = allInvoices.filter(i => i.paymentStatus === 'unpaid').length;
    const overpaid = allInvoices.filter(i => i.paymentStatus === 'overpaid').length;
    const cancelled = allInvoices.filter(i => i.paymentStatus === 'cancelled').length;
    
    // Calculate expired count
    const expired = allInvoices.filter(inv => {
      if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'cancelled' || inv.paymentStatus === 'overpaid') {
        return false;
      }
      const today = new Date();
      const dueDate = new Date(inv.dueDate);
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    // Create stats object in the format frontend expects
    const statsArray = [
      { _id: 'paid', count: paid },
      { _id: 'partial', count: partial },
      { _id: 'unpaid', count: unpaid },
      { _id: 'overpaid', count: overpaid },
      { _id: 'cancelled', count: cancelled }
    ];

    // Calculate total revenue
    const totalRevenue = allInvoices
      .filter(i => i.paymentStatus === 'paid')
      .reduce((sum, i) => sum + (i.finalTotal || 0), 0);

    console.log('📊 Stats calculated:', {
      paid,
      partial,
      unpaid,
      overpaid,
      cancelled,
      expired,
      total: allInvoices.length
    });

    res.json({
      success: true,
      data: {
        invoices,
        stats: statsArray, // Send stats array as expected by frontend
        totalRevenue,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching invoices'
    });
  }
};


// @route   GET /api/invoices/all
// @access  Private/Admin
const getAllInvoicesForStats = async (req, res) => {
  try {
    const { year, month } = req.query;

    const filter = {};

    // Apply date filter based on year/month
    if (year) {
      if (month) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        filter.invoiceDate = { $gte: startDate, $lte: endDate };
      } else {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        filter.invoiceDate = { $gte: startDate, $lte: endDate };
      }
    }

    const invoices = await Invoice.find(filter)
      .select('invoiceNumber paymentStatus finalTotal amountPaid dueDate invoiceDate')
      .sort({ invoiceDate: -1 });

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get all invoices for stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching invoices'
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    let invoice;
    
    // If admin, can access any invoice
    if (req.user.role === 'admin') {
      invoice = await Invoice.findById(req.params.id)
        .populate('userId', 'companyName email phone')
        .populate('createdBy', 'contactPerson email');
    } else {
      // If customer, can only access their own invoices
      invoice = await Invoice.findOne({
        _id: req.params.id,
        userId: req.user.id
      }).populate('createdBy', 'contactPerson email');
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching invoice'
    });
  }
};

// @desc    Get customer's invoices (Customer only)
// @route   GET /api/invoices/my-invoices
// @access  Private
const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get my invoices error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching invoices'
    });
  }
};


// @desc    Update invoice (Admin only)
// @route   PUT /api/invoices/:id
// @access  Private/Admin
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Don't allow updating paid invoices
    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a paid invoice'
      });
    }

    // Don't allow updating cancelled invoices
    if (invoice.paymentStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a cancelled invoice'
      });
    }

    
    // Store old values for change tracking
    const oldValues = {
      finalTotal: invoice.finalTotal,
      amountPaid: invoice.amountPaid,
      paymentStatus: invoice.paymentStatus
    };

    const updateData = { ...req.body, updatedAt: new Date() };
   
    // Clean up banking terms if present
    if (updateData.bankingTerms && Array.isArray(updateData.bankingTerms)) {
      updateData.bankingTerms = updateData.bankingTerms.filter(term => 
        term.title?.trim() !== '' || term.value?.trim() !== ''
      );
    }


    // Recalculate payment details if amount paid or final total changed
    if (req.body.amountPaid !== undefined || req.body.finalTotal !== undefined) {
      const finalTotal = req.body.finalTotal !== undefined ? req.body.finalTotal : invoice.finalTotal;
      const amountPaid = req.body.amountPaid !== undefined ? req.body.amountPaid : invoice.amountPaid;
      
      const paymentDetails = calculatePaymentStatus(finalTotal, amountPaid);
      updateData.paymentStatus = paymentDetails.paymentStatus;
      updateData.paidPercentage = paymentDetails.paidPercentage;
      updateData.unpaidPercentage = paymentDetails.unpaidPercentage;
      updateData.dueAmount = paymentDetails.dueAmount;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

     try {
      // Only send emails if payment status changed or significant changes
      if (oldValues.paymentStatus !== updatedInvoice.paymentStatus || 
          oldValues.finalTotal !== updatedInvoice.finalTotal ||
          oldValues.amountPaid !== updatedInvoice.amountPaid) {
        
        const customerDetails = {
          companyName: updatedInvoice.customer.companyName,
          contactPerson: updatedInvoice.customer.contactPerson,
          email: updatedInvoice.customer.email,
          phone: updatedInvoice.customer.phone,
          whatsapp: updatedInvoice.customer.whatsapp
        };
        
        // Create a description of changes
        let changes = [];
        if (oldValues.finalTotal !== updatedInvoice.finalTotal) {
          changes.push(`Total amount changed from ${formatPrice(oldValues.finalTotal)} to ${formatPrice(updatedInvoice.finalTotal)}`);
        }
        if (oldValues.amountPaid !== updatedInvoice.amountPaid) {
          changes.push(`Paid amount changed from ${formatPrice(oldValues.amountPaid)} to ${formatPrice(updatedInvoice.amountPaid)}`);
        }
        if (oldValues.paymentStatus !== updatedInvoice.paymentStatus) {
          changes.push(`Payment status changed from ${oldValues.paymentStatus} to ${updatedInvoice.paymentStatus}`);
        }
        
        const changesText = changes.join('. ');
        
        await sendInvoiceUpdateEmails(updatedInvoice, customerDetails, changesText);
        console.log(`📧 Invoice update emails sent for: ${updatedInvoice.invoiceNumber}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send invoice update emails:', emailError.message);
    }
     // --- END EMAILS ---

    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating invoice'
    });
  }
};

// @desc    Delete invoice (Admin only)
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Don't allow deleting paid invoices
    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a paid invoice'
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting invoice'
    });
  }
};


// @desc    Update payment status (Admin only)
// @route   PUT /api/invoices/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { amountPaid, status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Store old status for email
    const oldStatus = invoice.paymentStatus;

    // Update amount paid if provided
    if (amountPaid !== undefined) {
      invoice.amountPaid = amountPaid;
      
      // Recalculate payment details
      const paymentDetails = calculatePaymentStatus(invoice.finalTotal, amountPaid);
      invoice.paymentStatus = paymentDetails.paymentStatus;
      invoice.paidPercentage = paymentDetails.paidPercentage;
      invoice.unpaidPercentage = paymentDetails.unpaidPercentage;
      invoice.dueAmount = paymentDetails.dueAmount;
    }

    // Allow manual status override
    if (status) {
      // Only allow valid statuses
      if (['paid', 'partial', 'unpaid', 'overpaid', 'cancelled'].includes(status)) {
        invoice.paymentStatus = status;
        
        // Recalculate percentages based on status
        if (status === 'paid') {
          invoice.paidPercentage = 100;
          invoice.unpaidPercentage = 0;
          invoice.amountPaid = invoice.finalTotal;
          invoice.dueAmount = 0;
        } else if (status === 'unpaid') {
          invoice.paidPercentage = 0;
          invoice.unpaidPercentage = 100;
          invoice.amountPaid = 0;
          invoice.dueAmount = invoice.finalTotal;
        }
        // For partial and overpaid, keep the calculated percentages
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment status'
        });
      }
    }

    await invoice.save();

      // --- SEND PAYMENT STATUS UPDATE EMAILS ---
    try {
      // Only send if status actually changed
      if (oldStatus !== invoice.paymentStatus) {
        const customerDetails = {
          companyName: invoice.customer.companyName,
          contactPerson: invoice.customer.contactPerson,
          email: invoice.customer.email,
          phone: invoice.customer.phone,
          whatsapp: invoice.customer.whatsapp
        };
        
        await sendPaymentStatusUpdateEmails(invoice, customerDetails, oldStatus, invoice.paymentStatus);
        console.log(`📧 Payment status update emails sent for: ${invoice.invoiceNumber} (${oldStatus} → ${invoice.paymentStatus})`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send payment status emails:', emailError.message);
    }
    // --- END EMAILS ---

    res.json({
      success: true,
      data: invoice,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating payment'
    });
  }
};

// @desc    Cancel invoice (Admin only)
// @route   PUT /api/invoices/:id/cancel
// @access  Private/Admin
const cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Can't cancel paid invoices
    if (invoice.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a paid invoice'
      });
    }

      const oldStatus = invoice.paymentStatus;
    invoice.paymentStatus = 'cancelled';
    await invoice.save();

      // --- SEND PAYMENT STATUS UPDATE EMAILS ---
    try {
      const customerDetails = {
        companyName: invoice.customer.companyName,
        contactPerson: invoice.customer.contactPerson,
        email: invoice.customer.email,
        phone: invoice.customer.phone,
        whatsapp: invoice.customer.whatsapp
      };
      
      await sendPaymentStatusUpdateEmails(invoice, customerDetails, oldStatus, 'cancelled');
      console.log(`📧 Invoice cancellation emails sent for: ${invoice.invoiceNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send cancellation emails:', emailError.message);
    }
    // --- END EMAILS ---

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel invoice error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error cancelling invoice'
    });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getAllInvoicesForStats,
  getInvoiceById,
  getMyInvoices,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus,
  cancelInvoice,
  getNextInvoiceNumber
};