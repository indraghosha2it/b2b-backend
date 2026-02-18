const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../config/cloudinary'); // Import the new multiple upload
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  toggleProductStatus,
  getProductsByCategory
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

// All routes below require authentication
router.use(protect);

// Create product - Moderators and Admins
router.post('/', 
  isModeratorOrAdmin,
  uploadMultiple('images', 4), // Field name 'images', max 4 files
  createProduct
);

// Update product - Moderators can update own, Admins can update any
router.put('/:id', 
  isModeratorOrAdmin,
  uploadMultiple('images', 4),
  updateProduct
);

// Admin only routes
router.delete('/:id', isAdmin, deleteProduct);
router.put('/:id/approve', isAdmin, approveProduct);
router.put('/:id/toggle', isAdmin, toggleProductStatus);

module.exports = router;