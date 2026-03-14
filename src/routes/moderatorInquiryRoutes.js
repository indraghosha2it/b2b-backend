const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getModeratorInquiries
} = require('../controllers/inquiryController');

console.log('✅ Moderator inquiry routes loaded!'); // ADD THIS LINE

// All routes require authentication AND moderator role (or admin)
router.use(protect);
router.use(authorize('moderator', 'admin'));

// Get all inquiries (view only for moderators)
router.get('/', getModeratorInquiries);

module.exports = router;