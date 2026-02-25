// src/routes/adminInquiryRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware'); // protect + isAdmin
const {
  getAllInquiries,
  getAdminInquiryById,
  updateInquiryStatus,
  addInternalNote,
  getDashboardStats,
  deleteInquiry
} = require('../controllers/inquiryController');

// All routes require authentication AND admin role
router.use(protect);
router.use(isAdmin); // or use authorize('admin')

router.get('/stats/dashboard', getDashboardStats);
router.get('/', getAllInquiries);
router.get('/:id', getAdminInquiryById);
router.put('/:id/status', updateInquiryStatus);
router.post('/:id/notes', addInternalNote);
router.delete('/:id', deleteInquiry);

module.exports = router;