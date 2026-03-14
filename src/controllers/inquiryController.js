// const Inquiry = require('../models/Inquiry');
// const InquiryCart = require('../models/InquiryCart');
// const { sendInquirySubmissionEmails } = require('../utils/emailService');


// (async () => {
//   try {
//     console.log('🧪 Testing email service on server start...');
//     console.log('📧 Email service function exists:', typeof sendInquirySubmissionEmails === 'function');
    
//     // Don't actually send email, just check if function exists
//     if (typeof sendInquirySubmissionEmails === 'function') {
//       console.log('✅ Email service loaded successfully');
//     } else {
//       console.error('❌ Email service not loaded properly');
//     }
//   } catch (error) {
//     console.error('🧪 Test email error:', error);
//   }
// })();

// // @desc    Submit inquiry from cart
// // @route   POST /api/inquiry-cart/submit
// // @access  Private
// // const submitInquiry = async (req, res) => {
// //   try {
// //     const { specialInstructions, attachments } = req.body; // Global instructions

// //     console.log('📝 Submitting inquiry for user:', req.user.id);

// //     // Get user's cart
// //     const cart = await InquiryCart.findOne({ userId: req.user.id });
// //     if (!cart || cart.items.length === 0) {
// //       return res.status(400).json({
// //         success: false,
// //         error: 'Cart is empty'
// //       });
// //     }

// //     // Get user details from req.user
// //     const userDetails = {
// //       companyName: req.user.companyName || '',
// //       contactPerson: req.user.contactPerson || '',
// //       email: req.user.email || '',
// //       phone: req.user.phone || '',
// //       whatsapp: req.user.whatsapp || '',
// //       country: req.user.country || '',
// //       address: req.user.address || '',
// //       city: req.user.city || '',
// //       zipCode: req.user.zipCode || ''
// //     };

// //     // Directly use cart items - they already have the correct structure!
// //     // No need to flatten or transform - just copy the structure
// //     const inquiryItems = cart.items.map(cartItem => {
// //       // Create a deep copy of the cart item with the exact same structure
// //       return {
// //         productId: cartItem.productId,
// //         productName: cartItem.productName,
// //         colors: cartItem.colors.map(color => ({
// //           color: color.color,
// //           sizeQuantities: color.sizeQuantities.filter(sq => sq.quantity > 0), // Only keep non-zero quantities
// //           totalForColor: color.totalForColor,
// //           specialInstructions: color.specialInstructions || ''
// //         })),
// //         totalQuantity: cartItem.totalQuantity,
// //         unitPrice: cartItem.unitPrice,
// //         moq: cartItem.moq,
// //         productImage: cartItem.productImage || '',
// //         specialInstructions: cartItem.specialInstructions || ''
// //       };
// //     });

// //     console.log(`📦 Creating inquiry with ${inquiryItems.length} products`);
// //     console.log('📊 Products:', inquiryItems.map(item => ({
// //       product: item.productName,
// //       colors: item.colors.length,
// //       totalQty: item.totalQuantity
// //     })));

// //     // Create inquiry with the exact same structure as cart
// //     const inquiry = new Inquiry({
// //       userId: req.user.id,
// //       userDetails,
// //       items: inquiryItems,
// //       specialInstructions: specialInstructions || '',
// //       attachments: attachments || [],
// //       totalItems: inquiryItems.length,
// //       totalQuantity: cart.totalQuantity,
// //       subtotal: cart.estimatedTotal,
// //       status: 'submitted'
// //     });

// //     await inquiry.save();

// //     console.log('✅ Inquiry created successfully:', inquiry.inquiryNumber);
// //     console.log('📦 Saved inquiry structure:', JSON.stringify({
// //       inquiryNumber: inquiry.inquiryNumber,
// //       items: inquiry.items.map(item => ({
// //         product: item.productName,
// //         colorsCount: item.colors.length,
// //         colors: item.colors.map(c => ({
// //           color: c.color.code,
// //           totalForColor: c.totalForColor,
// //           sizeCount: c.sizeQuantities.length
// //         }))
// //       }))
// //     }, null, 2));

// //     // Clear the cart after successful submission
// //     cart.items = [];
// //     await cart.save();

// //        // --- EMAIL NOTIFICATIONS (fire and forget - don't await) ---
// //     try {
// //       // Import email service (add this at the top of your file)
// //       const { sendInquirySubmissionEmails } = require('../utils/emailService');
      
// //       // Send emails in background - don't await to not delay response
// //       sendInquirySubmissionEmails(inquiry, userDetails).catch(emailError => {
// //         console.error('❌ Background email sending failed:', emailError);
// //         // Log to your error tracking service if needed
// //       });
      
// //       console.log('📧 Email notifications queued for inquiry:', inquiry.inquiryNumber);
// //     } catch (emailServiceError) {
// //       // Email service not available - log but don't fail the request
// //       console.error('❌ Email service unavailable:', emailServiceError.message);
// //     }

// //     res.status(201).json({
// //       success: true,
// //       data: {
// //         inquiryId: inquiry._id,
// //         inquiryNumber: inquiry.inquiryNumber,
// //         status: inquiry.status
// //       },
// //       message: 'Inquiry submitted successfully'
// //     });
// //   } catch (error) {
// //     console.error('❌ Submit inquiry error:', error);
// //     res.status(500).json({
// //       success: false,
// //       error: error.message || 'Error submitting inquiry'
// //     });
// //   }
// // };


// // @desc    Submit inquiry from cart
// // @route   POST /api/inquiry-cart/submit
// // @access  Private
// // @desc    Submit inquiry from cart
// // @route   POST /api/inquiry-cart/submit
// // @access  Private
// const submitInquiry = async (req, res) => {
//   try {
//     const { specialInstructions, attachments } = req.body;

//     console.log('📝 Submitting inquiry for user:', req.user.id);

//     // Get user's cart
//     const cart = await InquiryCart.findOne({ userId: req.user.id });
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Cart is empty'
//       });
//     }

//     // Get user details from req.user
//     const userDetails = {
//       companyName: req.user.companyName || '',
//       contactPerson: req.user.contactPerson || '',
//       email: req.user.email || '',
//       phone: req.user.phone || '',
//       whatsapp: req.user.whatsapp || '',
//       country: req.user.country || '',
//       address: req.user.address || '',
//       city: req.user.city || '',
//       zipCode: req.user.zipCode || ''
//     };

//     // ===== DEBUG LOG #1 =====
//     console.log('🔍 User email from database:', {
//       email: req.user.email,
//       companyName: req.user.companyName,
//       userId: req.user.id
//     });
//     // ========================

//     console.log('📧 Customer email for notifications:', userDetails.email);

//     // Directly use cart items
//     const inquiryItems = cart.items.map(cartItem => {
//       return {
//         productId: cartItem.productId,
//         productName: cartItem.productName,
//         colors: cartItem.colors.map(color => ({
//           color: color.color,
//           sizeQuantities: color.sizeQuantities.filter(sq => sq.quantity > 0),
//           totalForColor: color.totalForColor,
//           specialInstructions: color.specialInstructions || ''
//         })),
//         totalQuantity: cartItem.totalQuantity,
//         unitPrice: cartItem.unitPrice,
//         moq: cartItem.moq,
//         productImage: cartItem.productImage || '',
//         specialInstructions: cartItem.specialInstructions || ''
//       };
//     });

//     console.log(`📦 Creating inquiry with ${inquiryItems.length} products`);

//     // Create inquiry
//     const inquiry = new Inquiry({
//       userId: req.user.id,
//       userDetails,
//       items: inquiryItems,
//       specialInstructions: specialInstructions || '',
//       attachments: attachments || [],
//       totalItems: inquiryItems.length,
//       totalQuantity: cart.totalQuantity,
//       subtotal: cart.estimatedTotal,
//       status: 'submitted'
//     });

//     await inquiry.save();
//     console.log('✅ Inquiry created successfully:', inquiry.inquiryNumber);

//     // Clear the cart after successful submission
//     cart.items = [];
//     await cart.save();

//     // ===== DEBUG LOG #2 =====
//     console.log('📧 Email service check:', {
//       hasSendFunction: typeof sendInquirySubmissionEmails === 'function',
//       serviceName: sendInquirySubmissionEmails ? sendInquirySubmissionEmails.name : 'not found'
//     });
//     // ========================

//     // --- EMAIL NOTIFICATIONS ---
//     try {
//       console.log('📧 Attempting to send email notifications...');
//       console.log('📧 About to call sendInquirySubmissionEmails with:', {
//         inquiryNumber: inquiry.inquiryNumber,
//         customerEmail: userDetails.email,
//         hasInquiry: !!inquiry,
//         hasUserDetails: !!userDetails
//       });
      
//       const emailResult = await sendInquirySubmissionEmails(inquiry, userDetails);
      
//       console.log('📧 Email result:', emailResult);
      
//       if (emailResult.success) {
//         console.log('✅ Email notifications sent successfully. Message ID:', emailResult.messageId);
//       } else {
//         console.error('❌ Email sending failed:', emailResult.error);
//       }
//     } catch (emailError) {
//       console.error('❌ Error in email notification process:', {
//         message: emailError.message,
//         stack: emailError.stack
//       });
//     }
//     // --- END EMAIL NOTIFICATIONS ---

//     res.status(201).json({
//       success: true,
//       data: {
//         inquiryId: inquiry._id,
//         inquiryNumber: inquiry.inquiryNumber,
//         status: inquiry.status
//       },
//       message: 'Inquiry submitted successfully'
//     });
//   } catch (error) {
//     console.error('❌ Submit inquiry error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error submitting inquiry'
//     });
//   }
// };

// // @desc    Get user's inquiries (Customer Dashboard)
// // @route   GET /api/inquiries/my-inquiries
// // @access  Private
// const getMyInquiries = async (req, res) => {
//   try {
//     const inquiries = await Inquiry.find({ userId: req.user.id })
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       data: inquiries
//     });
//   } catch (error) {
//     console.error('Get my inquiries error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching inquiries'
//     });
//   }
// };

// // @desc    Get single inquiry by ID (Customer)
// // @route   GET /api/inquiries/:id
// // @access  Private
// const getInquiryById = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findOne({
//       _id: req.params.id,
//       userId: req.user.id
//     });

//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: inquiry
//     });
//   } catch (error) {
//     console.error('Get inquiry error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching inquiry'
//     });
//   }
// };

// // @desc    Cancel inquiry (Customer)
// // @route   PUT /api/inquiries/:id/cancel
// // @access  Private
// const cancelInquiry = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findOne({
//       _id: req.params.id,
//       userId: req.user.id
//     });

//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     if (inquiry.status !== 'submitted') {
//       return res.status(400).json({
//         success: false,
//         error: 'Cannot cancel inquiry that has already been quoted or invoiced'
//       });
//     }

//     inquiry.status = 'cancelled';
//     await inquiry.save();

//     res.json({
//       success: true,
//       data: inquiry,
//       message: 'Inquiry cancelled successfully'
//     });
//   } catch (error) {
//     console.error('Cancel inquiry error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error cancelling inquiry'
//     });
//   }
// };
// // @desc    Accept quote (Customer)
// // @route   PUT /api/inquiries/:id/accept
// // @access  Private
// const acceptQuote = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findOne({
//       _id: req.params.id,
//       userId: req.user.id
//     });

//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     // Check if inquiry is in quoted status
//     if (inquiry.status !== 'quoted') {
//       return res.status(400).json({
//         success: false,
//         error: 'Can only accept inquiries that are in quoted status'
//       });
//     }

//     // Update status to accepted
//     inquiry.status = 'accepted';
//     await inquiry.save();

//     console.log(`✅ Inquiry ${inquiry.inquiryNumber} accepted by customer ${req.user.id}`);

//     res.json({
//       success: true,
//       data: inquiry,
//       message: 'Quote accepted successfully'
//     });
//   } catch (error) {
//     console.error('Accept quote error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error accepting quote'
//     });
//   }
// };

// // ========== ADMIN CONTROLLERS ==========

// // @desc    Get all inquiries (Admin)
// // @route   GET /api/admin/inquiries
// // @access  Private/Admin
// const getAllInquiries = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 10, 
//       status, 
//       startDate, 
//       endDate,
//       search 
//     } = req.query;

//     const filter = {};
    
//     if (status) filter.status = status;
    
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) filter.createdAt.$lte = new Date(endDate);
//     }

//     if (search) {
//       filter.$or = [
//         { inquiryNumber: { $regex: search, $options: 'i' } },
//         { 'userDetails.companyName': { $regex: search, $options: 'i' } },
//         { 'userDetails.contactPerson': { $regex: search, $options: 'i' } }
//       ];
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const inquiries = await Inquiry.find(filter)
//       .populate('userId', 'companyName email role')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Inquiry.countDocuments(filter);

//     // Get statistics
//     const stats = await Inquiry.aggregate([
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 },
//           totalValue: { $sum: '$subtotal' }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         inquiries,
//         stats,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get inquiries error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching inquiries'
//     });
//   }
// };

// // @desc    Get single inquiry by ID (Admin)
// // @route   GET /api/admin/inquiries/:id
// // @access  Private/Admin
// const getAdminInquiryById = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findById(req.params.id)
//       .populate('userId', 'companyName email phone role');

//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: inquiry
//     });
//   } catch (error) {
//     console.error('Get inquiry error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching inquiry'
//     });
//   }
// };

// // @desc    Update inquiry status (Admin)
// // @route   PUT /api/admin/inquiries/:id/status
// // @access  Private/Admin
// const updateInquiryStatus = async (req, res) => {
//   try {
//     const { status, internalNotes } = req.body;
    
//     const inquiry = await Inquiry.findById(req.params.id);
    
//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     const validTransitions = {
//       'submitted': ['quoted', 'cancelled'],
//       'quoted': ['invoiced', 'cancelled'],
//       'invoiced': ['paid', 'cancelled'],
//       'paid': [],
//       'cancelled': []
//     };

//     if (!validTransitions[inquiry.status]?.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         error: `Cannot transition from ${inquiry.status} to ${status}`
//       });
//     }

//     inquiry.status = status;
    
//     if (internalNotes) {
//       if (!inquiry.internalNotes) inquiry.internalNotes = [];
//       inquiry.internalNotes.push({
//         note: internalNotes,
//         addedBy: req.user.id,
//         addedAt: new Date()
//       });
//     }

//     await inquiry.save();

//     res.json({
//       success: true,
//       data: inquiry,
//       message: `Inquiry status updated to ${status}`
//     });
//   } catch (error) {
//     console.error('Update inquiry status error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error updating inquiry status'
//     });
//   }
// };

// // @desc    Add internal note to inquiry (Admin/Moderator)
// // @route   POST /api/admin/inquiries/:id/notes
// // @access  Private/Admin/Moderator
// const addInternalNote = async (req, res) => {
//   try {
//     const { note } = req.body;
    
//     const inquiry = await Inquiry.findById(req.params.id);
    
//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     if (!inquiry.internalNotes) inquiry.internalNotes = [];

//     inquiry.internalNotes.push({
//       note,
//       addedBy: req.user.id,
//       addedAt: new Date()
//     });

//     await inquiry.save();

//     res.json({
//       success: true,
//       data: inquiry.internalNotes,
//       message: 'Note added successfully'
//     });
//   } catch (error) {
//     console.error('Add note error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error adding note'
//     });
//   }
// };

// // @desc    Get dashboard statistics (Admin)
// // @route   GET /api/admin/inquiries/stats/dashboard
// // @access  Private/Admin
// const getDashboardStats = async (req, res) => {
//   try {
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

//     const [
//       totalInquiries,
//       pendingQuotations,
//       unpaidInvoices,
//       monthlyRevenue,
//       recentInquiries,
//       statusBreakdown
//     ] = await Promise.all([
//       Inquiry.countDocuments(),
//       Inquiry.countDocuments({ status: 'submitted' }),
//       Inquiry.countDocuments({ status: 'invoiced' }),
//       Inquiry.aggregate([
//         {
//           $match: {
//             status: 'paid',
//             updatedAt: { $gte: startOfMonth }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: '$subtotal' }
//           }
//         }
//       ]),
//       Inquiry.find()
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select('inquiryNumber userDetails.companyName status subtotal createdAt'),
//       Inquiry.aggregate([
//         {
//           $group: {
//             _id: '$status',
//             count: { $sum: 1 },
//             value: { $sum: '$subtotal' }
//           }
//         }
//       ])
//     ]);

//     const lastMonthRevenue = await Inquiry.aggregate([
//       {
//         $match: {
//           status: 'paid',
//           updatedAt: {
//             $gte: startOfLastMonth,
//             $lte: endOfLastMonth
//           }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: '$subtotal' }
//         }
//       }
//     ]);

//     const currentMonthTotal = monthlyRevenue[0]?.total || 0;
//     const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
    
//     const revenueGrowth = lastMonthTotal > 0 
//       ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
//       : 0;

//     res.json({
//       success: true,
//       data: {
//         overview: {
//           totalInquiries,
//           pendingQuotations,
//           unpaidInvoices,
//           monthlyRevenue: currentMonthTotal,
//           revenueGrowth: Math.round(revenueGrowth * 100) / 100
//         },
//         recentInquiries,
//         statusBreakdown: statusBreakdown.reduce((acc, item) => {
//           acc[item._id] = {
//             count: item.count,
//             value: item.value
//           };
//           return acc;
//         }, {})
//       }
//     });
//   } catch (error) {
//     console.error('Get dashboard stats error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching dashboard statistics'
//     });
//   }
// };
// // @desc    Delete inquiry (Admin)
// // @route   DELETE /api/admin/inquiries/:id
// // @access  Private/Admin
// const deleteInquiry = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findById(req.params.id);
    
//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     // Optional: Add protection to prevent deleting paid inquiries
//     if (inquiry.status === 'paid') {
//       return res.status(400).json({
//         success: false,
//         error: 'Cannot delete a paid inquiry'
//       });
//     }

//     await Inquiry.findByIdAndDelete(req.params.id);

//     console.log(`🗑️ Inquiry ${inquiry.inquiryNumber} deleted by admin ${req.user.id}`);

//     res.json({
//       success: true,
//       message: 'Inquiry deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete inquiry error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error deleting inquiry'
//     });
//   }
// };

// module.exports = {
//   // Customer endpoints
//   submitInquiry,
//   getMyInquiries,
//   getInquiryById,
//   cancelInquiry,
//   acceptQuote,
  
//   // Admin endpoints
//   getAllInquiries,
//   getAdminInquiryById,
//   updateInquiryStatus,
//   addInternalNote,
//   getDashboardStats,
//    deleteInquiry 
// };



const Inquiry = require('../models/Inquiry');
const InquiryCart = require('../models/InquiryCart');
const Invoice = require('../models/Invoice');
const { sendStatusUpdateEmail } = require('../utils/emailService');

// @desc    Submit inquiry from cart
// @route   POST /api/inquiry-cart/submit
// @access  Private
const submitInquiry = async (req, res) => {
  try {
    const { specialInstructions, attachments } = req.body; // Global instructions

    console.log('📝 Submitting inquiry for user:', req.user.id);

    // Get user's cart
    const cart = await InquiryCart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Get user details from req.user
    const userDetails = {
      companyName: req.user.companyName || '',
      contactPerson: req.user.contactPerson || '',
      email: req.user.email || '',
      phone: req.user.phone || '',
      whatsapp: req.user.whatsapp || '',
      country: req.user.country || '',
      address: req.user.address || '',
      city: req.user.city || '',
      zipCode: req.user.zipCode || ''
    };

    // Directly use cart items - they already have the correct structure!
    // No need to flatten or transform - just copy the structure
    const inquiryItems = cart.items.map(cartItem => {
      // Create a deep copy of the cart item with the exact same structure
      return {
        productId: cartItem.productId,
        productName: cartItem.productName,
        colors: cartItem.colors.map(color => ({
          color: color.color,
          sizeQuantities: color.sizeQuantities.filter(sq => sq.quantity > 0), // Only keep non-zero quantities
          totalForColor: color.totalForColor,
          specialInstructions: color.specialInstructions || ''
        })),
        totalQuantity: cartItem.totalQuantity,
        unitPrice: cartItem.unitPrice,
        moq: cartItem.moq,
        productImage: cartItem.productImage || '',
        specialInstructions: cartItem.specialInstructions || ''
      };
    });

    console.log(`📦 Creating inquiry with ${inquiryItems.length} products`);
    console.log('📊 Products:', inquiryItems.map(item => ({
      product: item.productName,
      colors: item.colors.length,
      totalQty: item.totalQuantity
    })));

    // Create inquiry with the exact same structure as cart
    const inquiry = new Inquiry({
      userId: req.user.id,
      userDetails,
      items: inquiryItems,
      specialInstructions: specialInstructions || '',
      attachments: attachments || [],
      totalItems: inquiryItems.length,
      totalQuantity: cart.totalQuantity,
      subtotal: cart.estimatedTotal,
      status: 'submitted'
    });

    await inquiry.save();

    console.log('✅ Inquiry created successfully:', inquiry.inquiryNumber);
    console.log('📦 Saved inquiry structure:', JSON.stringify({
      inquiryNumber: inquiry.inquiryNumber,
      items: inquiry.items.map(item => ({
        product: item.productName,
        colorsCount: item.colors.length,
        colors: item.colors.map(c => ({
          color: c.color.code,
          totalForColor: c.totalForColor,
          sizeCount: c.sizeQuantities.length
        }))
      }))
    }, null, 2));

    // Clear the cart after successful submission
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: {
        inquiryId: inquiry._id,
        inquiryNumber: inquiry.inquiryNumber,
        status: inquiry.status
      },
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('❌ Submit inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error submitting inquiry'
    });
  }
};

// @desc    Get user's inquiries (Customer Dashboard)
// @route   GET /api/inquiries/my-inquiries
// @access  Private
const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Get my inquiries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiries'
    });
  }
};

// @desc    Get single inquiry by ID (Customer)
// @route   GET /api/inquiries/:id
// @access  Private
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiry'
    });
  }
};

// @desc    Cancel inquiry (Customer)
// @route   PUT /api/inquiries/:id/cancel
// @access  Private
// const cancelInquiry = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findOne({
//       _id: req.params.id,
//       userId: req.user.id
//     });

//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     if (inquiry.status !== 'submitted') {
//       return res.status(400).json({
//         success: false,
//         error: 'Cannot cancel inquiry that has already been quoted or invoiced'
//       });
//     }

//     inquiry.status = 'cancelled';
//     await inquiry.save();

//     res.json({
//       success: true,
//       data: inquiry,
//       message: 'Inquiry cancelled successfully'
//     });
//   } catch (error) {
//     console.error('Cancel inquiry error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error cancelling inquiry'
//     });
//   }
// };
// @desc    Cancel inquiry (Customer)
// @route   PUT /api/inquiries/:id/cancel
// @access  Private
const cancelInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    if (inquiry.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel inquiry that has already been quoted or invoiced'
      });
    }

    const oldStatus = inquiry.status;
    inquiry.status = 'cancelled';
    await inquiry.save();

    // --- SEND STATUS UPDATE EMAIL ---
    try {
      await sendStatusUpdateEmail(inquiry, oldStatus, 'cancelled');
      console.log(`📧 Cancellation email sent for inquiry: ${inquiry.inquiryNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send cancellation email:', emailError.message);
    }
    // --- END EMAIL ---

    res.json({
      success: true,
      data: inquiry,
      message: 'Inquiry cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error cancelling inquiry'
    });
  }
};





// @desc    Accept quote (Customer)
// @route   PUT /api/inquiries/:id/accept
// @access  Private
// const acceptQuote = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findOne({
//       _id: req.params.id,
//       userId: req.user.id
//     });

//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     // Check if inquiry is in quoted status
//     if (inquiry.status !== 'quoted') {
//       return res.status(400).json({
//         success: false,
//         error: 'Can only accept inquiries that are in quoted status'
//       });
//     }

//     // Update status to accepted
//     inquiry.status = 'accepted';
//     await inquiry.save();

//     console.log(`✅ Inquiry ${inquiry.inquiryNumber} accepted by customer ${req.user.id}`);

//     res.json({
//       success: true,
//       data: inquiry,
//       message: 'Quote accepted successfully'
//     });
//   } catch (error) {
//     console.error('Accept quote error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error accepting quote'
//     });
//   }
// };


// @desc    Accept quote (Customer)
// @route   PUT /api/inquiries/:id/accept
// @access  Private
const acceptQuote = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    // Check if inquiry is in quoted status
    if (inquiry.status !== 'quoted') {
      return res.status(400).json({
        success: false,
        error: 'Can only accept inquiries that are in quoted status'
      });
    }

    const oldStatus = inquiry.status;
    // Update status to accepted
    inquiry.status = 'accepted';
    await inquiry.save();

    // --- SEND STATUS UPDATE EMAIL ---
    try {
      await sendStatusUpdateEmail(inquiry, oldStatus, 'accepted');
      console.log(`📧 Quote acceptance email sent for inquiry: ${inquiry.inquiryNumber}`);
    } catch (emailError) {
      console.error('❌ Failed to send acceptance email:', emailError.message);
    }
    // --- END EMAIL ---

    console.log(`✅ Inquiry ${inquiry.inquiryNumber} accepted by customer ${req.user.id}`);

    res.json({
      success: true,
      data: inquiry,
      message: 'Quote accepted successfully'
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error accepting quote'
    });
  }
};

// ========== ADMIN CONTROLLERS ==========

// @desc    Get all inquiries (Admin)
// @route   GET /api/admin/inquiries
// @access  Private/Admin
// const getAllInquiries = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 10, 
//       status, 
//       startDate, 
//       endDate,
//       search 
//     } = req.query;

//     const filter = {};
    
//     if (status) filter.status = status;
    
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) filter.createdAt.$lte = new Date(endDate);
//     }

//     if (search) {
//       filter.$or = [
//         { inquiryNumber: { $regex: search, $options: 'i' } },
//         { 'userDetails.companyName': { $regex: search, $options: 'i' } },
//         { 'userDetails.contactPerson': { $regex: search, $options: 'i' } }
//       ];
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const inquiries = await Inquiry.find(filter)
//       .populate('userId', 'companyName email role')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Inquiry.countDocuments(filter);

//     // Get statistics
//     const stats = await Inquiry.aggregate([
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 },
//           totalValue: { $sum: '$subtotal' }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         inquiries,
//         stats,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / parseInt(limit))
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get inquiries error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching inquiries'
//     });
//   }
// };
// @desc    Get all inquiries (Admin)
// @route   GET /api/admin/inquiries
// @access  Private/Admin
const getAllInquiries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      year,
      month,
      search 
    } = req.query;

    const filter = {};
    
    // Apply status filter
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }
    
    // Apply date filter based on year/month
    if (year) {
      if (month) {
        // Filter by specific month and year
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      } else {
        // Filter by specific year
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }

    // Apply search filter
    if (search) {
      filter.$or = [
        { inquiryNumber: { $regex: search, $options: 'i' } },
        { 'userDetails.companyName': { $regex: search, $options: 'i' } },
        { 'userDetails.contactPerson': { $regex: search, $options: 'i' } },
        { 'userDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const inquiries = await Inquiry.find(filter)
      .populate('userId', 'companyName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inquiry.countDocuments(filter);

    // Get ALL inquiries for stats (with same date filter but no pagination)
    const allInquiriesFilter = { ...filter };
    const allInquiries = await Inquiry.find(allInquiriesFilter);

    // Calculate stats from all inquiries
    const stats = {
      total: allInquiries.length,
      submitted: allInquiries.filter(i => i.status === 'submitted').length,
      quoted: allInquiries.filter(i => i.status === 'quoted').length,
      accepted: allInquiries.filter(i => i.status === 'accepted').length,
      invoiced: allInquiries.filter(i => i.status === 'invoiced').length,
      paid: allInquiries.filter(i => i.status === 'paid').length,
      cancelled: allInquiries.filter(i => i.status === 'cancelled').length,
      totalValue: allInquiries.reduce((sum, i) => sum + (i.subtotal || 0), 0)
    };

    res.json({
      success: true,
      data: {
        inquiries,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiries'
    });
  }
};
// @desc    Get all inquiries without pagination (for stats)
// @route   GET /api/admin/inquiries/all
// @access  Private/Admin
const getAllInquiriesForStats = async (req, res) => {
  try {
    const { year, month } = req.query;

    const filter = {};
    
    // Apply date filter based on year/month
    if (year) {
      if (month) {
        // Filter by specific month and year
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      } else {
        // Filter by specific year
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }

    const inquiries = await Inquiry.find(filter)
      .select('inquiryNumber userDetails companyName status subtotal createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Get all inquiries for stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiries'
    });
  }
};

// @desc    Get single inquiry by ID (Admin)
// @route   GET /api/admin/inquiries/:id
// @access  Private/Admin
const getAdminInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('userId', 'companyName email phone role');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiry'
    });
  }
};

// @desc    Update inquiry status (Admin)
// @route   PUT /api/admin/inquiries/:id/status
// @access  Private/Admin
// const updateInquiryStatus = async (req, res) => {
//   try {
//     const { status, internalNotes } = req.body;
    
//     const inquiry = await Inquiry.findById(req.params.id);
    
//     if (!inquiry) {
//       return res.status(404).json({
//         success: false,
//         error: 'Inquiry not found'
//       });
//     }

//     const validTransitions = {
//       'submitted': ['quoted', 'cancelled'],
//       'quoted': ['invoiced', 'cancelled'],
//       'invoiced': ['paid', 'cancelled'],
//       'paid': [],
//       'cancelled': []
//     };

//     if (!validTransitions[inquiry.status]?.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         error: `Cannot transition from ${inquiry.status} to ${status}`
//       });
//     }

//     inquiry.status = status;
    
//     if (internalNotes) {
//       if (!inquiry.internalNotes) inquiry.internalNotes = [];
//       inquiry.internalNotes.push({
//         note: internalNotes,
//         addedBy: req.user.id,
//         addedAt: new Date()
//       });
//     }

//     await inquiry.save();

//     res.json({
//       success: true,
//       data: inquiry,
//       message: `Inquiry status updated to ${status}`
//     });
//   } catch (error) {
//     console.error('Update inquiry status error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error updating inquiry status'
//     });
//   }
// };

// @desc    Update inquiry status (Admin)
// @route   PUT /api/admin/inquiries/:id/status
// @access  Private/Admin
const updateInquiryStatus = async (req, res) => {
  try {
    const { status, internalNotes } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    const validTransitions = {
      'submitted': ['quoted', 'cancelled'],
      'quoted': ['invoiced', 'cancelled'],
      'invoiced': ['paid', 'cancelled'],
      'paid': [],
      'cancelled': []
    };

    if (!validTransitions[inquiry.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from ${inquiry.status} to ${status}`
      });
    }

    const oldStatus = inquiry.status;
    inquiry.status = status;
    
    if (internalNotes) {
      if (!inquiry.internalNotes) inquiry.internalNotes = [];
      inquiry.internalNotes.push({
        note: internalNotes,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    await inquiry.save();

    // --- SEND STATUS UPDATE EMAIL TO CUSTOMER ---
    // Don't send email for 'cancelled' status as customer might have cancelled it themselves
    if (status !== 'cancelled') {
      try {
        await sendStatusUpdateEmail(inquiry, oldStatus, status);
        console.log(`📧 Status update email sent for inquiry: ${inquiry.inquiryNumber} (${oldStatus} → ${status})`);
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError.message);
      }
    }
    // --- END EMAIL ---

    res.json({
      success: true,
      data: inquiry,
      message: `Inquiry status updated to ${status}`
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating inquiry status'
    });
  }
};

// @desc    Add internal note to inquiry (Admin/Moderator)
// @route   POST /api/admin/inquiries/:id/notes
// @access  Private/Admin/Moderator
const addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    if (!inquiry.internalNotes) inquiry.internalNotes = [];

    inquiry.internalNotes.push({
      note,
      addedBy: req.user.id,
      addedAt: new Date()
    });

    await inquiry.save();

    res.json({
      success: true,
      data: inquiry.internalNotes,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error adding note'
    });
  }
};

// const getDashboardStats = async (req, res) => {
//   try {
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

//     console.log('Fetching dashboard stats...');

//     const [
//       totalInquiries,
//       pendingQuotations,
//       unpaidInvoicesCount,
//       partialInvoicesCount, // Added partial invoices count
//       monthlyRevenue,
//       recentInquiries,
//       statusBreakdown,
//       totalInvoices,
//       paidInvoicesCount,
//       lastMonthRevenue
//     ] = await Promise.all([
//       // Total inquiries
//       Inquiry.countDocuments(),
      
//       // Pending quotations (submitted status)
//       Inquiry.countDocuments({ status: 'submitted' }),
      
//       // Unpaid invoices from Invoice model
//       Invoice.countDocuments({ paymentStatus: 'unpaid' }),
      
//       // Partial payment invoices from Invoice model
//       Invoice.countDocuments({ paymentStatus: 'partial' }),
      
//       // Monthly revenue from PAID invoices
//       Invoice.aggregate([
//         {
//           $match: {
//             paymentStatus: 'paid',
//             createdAt: { $gte: startOfMonth }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: '$finalTotal' }
//           }
//         }
//       ]),
      
//       // Recent inquiries
//       Inquiry.find()
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select('inquiryNumber userDetails.companyName status subtotal createdAt items')
//         .lean(),
      
//       // Status breakdown from inquiries
//       Inquiry.aggregate([
//         {
//           $group: {
//             _id: '$status',
//             count: { $sum: 1 },
//             value: { $sum: '$subtotal' }
//           }
//         }
//       ]),
      
//       // Total invoices count
//       Invoice.countDocuments(),
      
//       // Paid invoices count
//       Invoice.countDocuments({ paymentStatus: 'paid' }),
      
//       // Last month revenue from paid invoices
//       Invoice.aggregate([
//         {
//           $match: {
//             paymentStatus: 'paid',
//             createdAt: {
//               $gte: startOfLastMonth,
//               $lte: endOfLastMonth
//             }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: '$finalTotal' }
//           }
//         }
//       ])
//     ]);

//     const currentMonthTotal = monthlyRevenue[0]?.total || 0;
//     const lastMonthTotal = lastMonthRevenue[0]?.total || 0;
    
//     const revenueGrowth = lastMonthTotal > 0 
//       ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
//       : 0;

//     // Format status breakdown as object
//     const breakdownObj = {};
//     statusBreakdown.forEach(item => {
//       breakdownObj[item._id] = {
//         count: item.count,
//         value: item.value
//       };
//     });

//     // Also fetch recent invoices with payment status
//     const recentInvoices = await Invoice.find()
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select('invoiceNumber customer.companyName paymentStatus finalTotal createdAt')
//       .lean();

//     // Calculate invoice status counts including partial
//     const invoiceStatusCounts = {
//       paid: paidInvoicesCount,
//       partial: partialInvoicesCount,
//       unpaid: unpaidInvoicesCount,
//       total: totalInvoices
//     };

//     const responseData = {
//       overview: {
//         totalInquiries,
//         pendingQuotations,
//         unpaidInvoices: unpaidInvoicesCount,
//         partialInvoices: partialInvoicesCount, // Added to overview
//         monthlyRevenue: currentMonthTotal,
//         revenueGrowth: Math.round(revenueGrowth * 100) / 100,
//         totalInvoices,
//         paidInvoices: paidInvoicesCount,
//         invoiceStatusCounts // Added full invoice status breakdown
//       },
//       recentInquiries,
//       recentInvoices,
//       statusBreakdown: breakdownObj
//     };

//     console.log('Dashboard stats response:', responseData);

//     res.json({
//       success: true,
//       data: responseData
//     });
//   } catch (error) {
//     console.error('❌ Get dashboard stats error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Error fetching dashboard statistics'
//     });
//   }
// };

// @desc    Delete inquiry (Admin)
// @route   DELETE /api/admin/inquiries/:id
// @access  Private/Admin


// @desc    Get dashboard stats
// @route   GET /api/admin/inquiries/stats/dashboard
// @access  Private/Admin
// @desc    Get dashboard stats
// @route   GET /api/admin/inquiries/stats/dashboard
// @access  Private/Admin
// @desc    Get dashboard stats
// @route   GET /api/admin/inquiries/stats/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let inquiryQuery = {}; // Empty for ALL data
    let invoiceQuery = {}; // Empty for ALL data
    let hasDateFilter = false;
    
    // Only apply date filters if month/year are provided
    if (month && year) {
      hasDateFilter = true;
      // Filter by specific month and year
      const startDate = new Date(year, month - 1, 1); // month is 1-12 from frontend
      const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
      
      console.log('Filtering by month/year:', { startDate, endDate });
      
      inquiryQuery = {
        createdAt: { $gte: startDate, $lte: endDate }
      };

      invoiceQuery = {
        invoiceDate: { $gte: startDate, $lte: endDate }
      };
    } else if (year && !month) {
      hasDateFilter = true;
      // Filter by specific year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      console.log('Filtering by year:', { startDate, endDate });
      
      inquiryQuery = {
        createdAt: { $gte: startDate, $lte: endDate }
      };

      invoiceQuery = {
        invoiceDate: { $gte: startDate, $lte: endDate }
      };
    } else {
      // NO FILTERS - return ALL data
      console.log('No date filters - returning ALL data');
      // Keep queries as empty objects {} to get all documents
    }

    console.log('Query:', { 
      hasDateFilter, 
      inquiryQuery: Object.keys(inquiryQuery).length ? inquiryQuery : 'ALL',
      invoiceQuery: Object.keys(invoiceQuery).length ? invoiceQuery : 'ALL'
    });

    const [
      totalInquiries,
      pendingQuotations,
      unpaidInvoicesCount,
      partialInvoicesCount,
      overpaidInvoicesCount,
      cancelledInvoicesCount,
      totalRevenue,
      recentInquiries,
      statusBreakdown,
      totalInvoices,
      paidInvoicesCount,
      allInvoicesInPeriod
    ] = await Promise.all([
      // Total inquiries (ALL if no filters)
      Inquiry.countDocuments(inquiryQuery),
      
      // Pending quotations (submitted status)
      Inquiry.countDocuments({ 
        ...inquiryQuery,
        status: 'submitted'
      }),
      
      // Unpaid invoices
      Invoice.countDocuments({ 
        ...invoiceQuery,
        paymentStatus: 'unpaid'
      }),
      
      // Partial payment invoices
      Invoice.countDocuments({ 
        ...invoiceQuery,
        paymentStatus: 'partial'
      }),
      
      // Overpaid invoices
      Invoice.countDocuments({ 
        ...invoiceQuery,
        paymentStatus: 'overpaid'
      }),
      
      // Cancelled invoices
      Invoice.countDocuments({ 
        ...invoiceQuery,
        paymentStatus: 'cancelled'
      }),
      
      // Total revenue from PAID invoices
      Invoice.aggregate([
        {
          $match: {
            ...invoiceQuery,
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$finalTotal' }
          }
        }
      ]),
      
      // Recent inquiries (LIMIT 5)
      Inquiry.find(inquiryQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('inquiryNumber userDetails.companyName status subtotal createdAt items')
        .lean(),
      
      // Status breakdown from inquiries
      Inquiry.aggregate([
        {
          $match: inquiryQuery
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            value: { $sum: '$subtotal' }
          }
        }
      ]),
      
      // Total invoices count
      Invoice.countDocuments(invoiceQuery),
      
      // Paid invoices count
      Invoice.countDocuments({ 
        ...invoiceQuery,
        paymentStatus: 'paid'
      }),
      
      // Get all invoices in the period for detailed status calculation
      Invoice.find(invoiceQuery)
        .select('paymentStatus finalTotal amountPaid dueDate invoiceDate')
        .lean()
    ]);

    const totalRevenueAmount = totalRevenue[0]?.total || 0;

    // Format status breakdown as object
    const breakdownObj = {};
    statusBreakdown.forEach(item => {
      breakdownObj[item._id] = {
        count: item.count,
        value: item.value
      };
    });

    // Calculate expired invoices from all invoices in the period
    const expiredCount = allInvoicesInPeriod.filter(inv => {
      // Don't count paid, cancelled, or overpaid as expired
      if (inv.paymentStatus === 'paid' || inv.paymentStatus === 'cancelled' || inv.paymentStatus === 'overpaid') {
        return false;
      }
      const today = new Date();
      const dueDate = new Date(inv.dueDate);
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    // Calculate pending value (sum of due amounts for unpaid/partial invoices)
    const pendingValue = allInvoicesInPeriod.reduce((total, invoice) => {
      if (invoice.paymentStatus === 'unpaid' || invoice.paymentStatus === 'partial') {
        const dueAmount = invoice.finalTotal - (invoice.amountPaid || 0);
        return total + dueAmount;
      }
      return total;
    }, 0);

    // Recent invoices (LIMIT 5)
    const recentInvoices = await Invoice.find(invoiceQuery)
      .sort({ invoiceDate: -1 })
      .limit(5)
      .select('invoiceNumber customer.companyName paymentStatus finalTotal invoiceDate dueDate amountPaid')
      .lean();

    // Calculate invoice status counts
    const invoiceStatusCounts = {
      paid: paidInvoicesCount,
      partial: partialInvoicesCount,
      unpaid: unpaidInvoicesCount,
      overpaid: overpaidInvoicesCount,
      cancelled: cancelledInvoicesCount,
      expired: expiredCount,
      total: totalInvoices
    };

    // Calculate revenue growth only if we have date filters
    let revenueGrowth = 0;
    if (hasDateFilter && month && year) {
      // Calculate previous period for comparison
      const prevMonthStart = new Date(year, month - 2, 1);
      const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);
      
      const prevMonthRevenue = await Invoice.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            invoiceDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$finalTotal' }
          }
        }
      ]);
      
      const prevMonthTotal = prevMonthRevenue[0]?.total || 0;
      revenueGrowth = prevMonthTotal > 0 
        ? ((totalRevenueAmount - prevMonthTotal) / prevMonthTotal) * 100 
        : 0;
    }

    const responseData = {
      overview: {
        totalInquiries,
        pendingQuotations,
        unpaidInvoices: unpaidInvoicesCount,
        partialInvoices: partialInvoicesCount,
        overpaidInvoices: overpaidInvoicesCount,
        cancelledInvoices: cancelledInvoicesCount,
        expiredInvoices: expiredCount,
        monthlyRevenue: totalRevenueAmount,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        totalInvoices,
        paidInvoices: paidInvoicesCount,
        pendingValue,
        invoiceStatusCounts
      },
      recentInquiries,
      recentInvoices,
      statusBreakdown: breakdownObj
    };

    console.log('Dashboard stats response:', JSON.stringify(responseData, null, 2));

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching dashboard statistics'
    });
  }
};


const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    // Optional: Add protection to prevent deleting paid inquiries
    if (inquiry.status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a paid inquiry'
      });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Inquiry ${inquiry.inquiryNumber} deleted by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting inquiry'
    });
  }
};

// @desc    Get all inquiries for moderator (view only)
// @route   GET /api/moderator/inquiries
// @access  Private/Moderator
const getModeratorInquiries = async (req, res) => {
  console.log('📋 getModeratorInquiries called with query:', req.query); // ADD THIS LINE
  
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      year,
      month,
      search 
    } = req.query;

    console.log('📅 Date filters - year:', year, 'month:', month); // ADD THIS LINE

    const filter = {};
    
    // Apply status filter
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }
    
    // Apply date filter based on year/month
    if (year) {
      if (month) {
        // Filter by specific month and year
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
        console.log(`📅 Moderator filtering by month: ${month}/${year}`, { startDate, endDate });
      } else {
        // Filter by specific year
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        
        filter.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
        console.log(`📅 Moderator filtering by year: ${year}`, { startDate, endDate });
      }
    }

    // Apply search filter
    if (search) {
      filter.$or = [
        { inquiryNumber: { $regex: search, $options: 'i' } },
        { 'userDetails.companyName': { $regex: search, $options: 'i' } },
        { 'userDetails.contactPerson': { $regex: search, $options: 'i' } },
        { 'userDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🔍 Final filter:', JSON.stringify(filter, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get paginated inquiries for display
    const inquiries = await Inquiry.find(filter)
      .populate('userId', 'companyName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inquiry.countDocuments(filter);

    console.log(`📊 Found ${inquiries.length} inquiries (page ${page}), total: ${total}`);

    // Get ALL inquiries with the same filter for stats (no pagination)
    const allInquiries = await Inquiry.find(filter);
    
    // Calculate stats from all inquiries
    const stats = [
      { _id: 'submitted', count: allInquiries.filter(i => i.status === 'submitted').length, totalValue: allInquiries.filter(i => i.status === 'submitted').reduce((sum, i) => sum + (i.subtotal || 0), 0) },
      { _id: 'quoted', count: allInquiries.filter(i => i.status === 'quoted').length, totalValue: allInquiries.filter(i => i.status === 'quoted').reduce((sum, i) => sum + (i.subtotal || 0), 0) },
      { _id: 'accepted', count: allInquiries.filter(i => i.status === 'accepted').length, totalValue: allInquiries.filter(i => i.status === 'accepted').reduce((sum, i) => sum + (i.subtotal || 0), 0) },
      { _id: 'invoiced', count: allInquiries.filter(i => i.status === 'invoiced').length, totalValue: allInquiries.filter(i => i.status === 'invoiced').reduce((sum, i) => sum + (i.subtotal || 0), 0) },
      { _id: 'paid', count: allInquiries.filter(i => i.status === 'paid').length, totalValue: allInquiries.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.subtotal || 0), 0) },
      { _id: 'cancelled', count: allInquiries.filter(i => i.status === 'cancelled').length, totalValue: allInquiries.filter(i => i.status === 'cancelled').reduce((sum, i) => sum + (i.subtotal || 0), 0) }
    ];

    // Calculate total value from all inquiries
    const totalValue = allInquiries.reduce((sum, i) => sum + (i.subtotal || 0), 0);

    console.log('📈 Stats calculated:', stats);

    res.json({
      success: true,
      data: {
        inquiries,
        stats,
        totalValue,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Get moderator inquiries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching inquiries'
    });
  }
};

module.exports = {
  // Customer endpoints
  submitInquiry,
  getMyInquiries,
  getInquiryById,
  cancelInquiry,
  acceptQuote,
  
  // Admin endpoints
  getAllInquiries,
  getAdminInquiryById,
  updateInquiryStatus,
  addInternalNote,
  getDashboardStats,
   deleteInquiry ,
   getAllInquiriesForStats,

   // Moderator endpoint
  getModeratorInquiries 
};
