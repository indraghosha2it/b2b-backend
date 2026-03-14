// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
// const {
//   createReview,
//   getReviews,
//   getReviewById,
//   updateReview,
//   deleteReview,
//   moderateReview,
//   toggleFeatured,
//   markHelpful,
//   addResponse,
//   getMyReviews,
//   getPendingCount,
//   getFeaturedReviews  // Make sure this is included
// } = require('../controllers/reviewController');

// // ==================== PUBLIC ROUTES ====================
// router.get('/', getReviews);
// router.get('/featured', getFeaturedReviews);
// router.get('/:id', getReviewById);

// // ==================== PROTECTED ROUTES (Any authenticated user) ====================
// router.use(protect);

// // User's own reviews
// router.get('/user/me', getMyReviews);
// router.post('/', createReview);
// router.put('/:id', updateReview);
// router.delete('/:id', deleteReview);
// router.post('/:id/helpful', markHelpful);

// // ==================== ADMIN/MODERATOR ROUTES ====================
// router.put('/:id/moderate', isModeratorOrAdmin, moderateReview);
// router.post('/:id/respond', isModeratorOrAdmin, addResponse);
// router.put('/:id/feature', isModeratorOrAdmin, toggleFeatured);
// router.get('/admin/pending/count', isModeratorOrAdmin, getPendingCount);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  moderateReview,
  toggleFeatured,
  markHelpful,
  addResponse,
  getMyReviews,
  getPendingCount,
  getFeaturedReviews,
  getProductReviews,
  getPublicReviews,
  getMyProductReview
} = require('../controllers/reviewController');

// ==================== PUBLIC ROUTES (no auth required) ====================
router.get('/featured', getFeaturedReviews);
router.get('/public', getPublicReviews);
router.get('/:id', getReviewById);
router.get('/product/:productId', getProductReviews);

// ==================== PROTECTED ROUTES (All routes below require authentication) ====================
router.use(protect);

// Get current user's review for a specific product (if any)
router.get('/product/:productId/my-review', getMyProductReview);

// Admin/Moderator routes - place these BEFORE user routes to avoid conflicts
router.get('/admin/pending/count', isModeratorOrAdmin, getPendingCount);

// Main reviews list - PROTECTED (admin/moderator can see all)
router.get('/', isModeratorOrAdmin, getReviews);

// User's own reviews
router.get('/user/me', getMyReviews);

// Review actions
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markHelpful);

// Admin/Moderator actions
router.put('/:id/moderate', isModeratorOrAdmin, moderateReview);
router.post('/:id/respond', isModeratorOrAdmin, addResponse);
router.put('/:id/feature', isModeratorOrAdmin, toggleFeatured);

module.exports = router;