const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Public routes (no authentication needed)
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes - All routes below require authentication
router.use(protect); // This applies to all routes below

// Moderators and Admins can create categories
router.post('/', 
  isModeratorOrAdmin, // This allows both admin and moderator
  upload.single('image'), 
  createCategory
);

// Moderators and Admins can update categories
router.put('/:id', 
  isModeratorOrAdmin, // This allows both admin and moderator
  upload.single('image'), 
  updateCategory
);

// Only Admins can delete categories
router.delete('/:id', 
  isModeratorOrAdmin, // Now allows both admin and moderator to delete
  deleteCategory
);

module.exports = router;