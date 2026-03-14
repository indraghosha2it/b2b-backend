const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  // Admin & Customer shared
  getInvoiceById,
  
  // Customer only
  getMyInvoices,
  
  // Admin only
  createInvoice,
  getAllInvoices,
  getAllInvoicesForStats,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus,
  cancelInvoice,
  getNextInvoiceNumber
} = require('../controllers/invoiceController');

// All routes require authentication
router.use(protect);

// Customer routes (any authenticated user)
router.get('/my-invoices', getMyInvoices);

router.get('/next-number', authorize('admin'), getNextInvoiceNumber);
router.get('/:id', getInvoiceById);


// IMPORTANT: This endpoint must come BEFORE the /:id route
router.get('/all', authorize('admin'), getAllInvoicesForStats);

// Admin routes
router.post('/', authorize('admin'), createInvoice);
router.get('/', authorize('admin'), getAllInvoices);
router.put('/:id', authorize('admin'), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);
router.put('/:id/payment', authorize('admin'), updatePaymentStatus);
router.put('/:id/cancel', authorize('admin'), cancelInvoice);

module.exports = router;