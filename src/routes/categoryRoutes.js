const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryDetails,

    addSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory
} = require('../controllers/categoryController');

// Public routes (no authentication needed)
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.get('/:id/details', getCategoryDetails);


// Subcategory public routes
router.get('/:categoryId/subcategories', getSubcategories);
router.get('/:categoryId/subcategories/:subcategoryId', getSubcategoryById);

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


// Subcategory CRUD (Moderators and Admins) - NO IMAGE UPLOAD NEEDED
router.post('/:categoryId/subcategories',
  isModeratorOrAdmin,
  // Remove upload.single('image') since we don't need image
  addSubcategory
);

router.put('/:categoryId/subcategories/:subcategoryId',
  isModeratorOrAdmin,
  // Remove upload.single('image') since we don't need image
  updateSubcategory
);

router.delete('/:categoryId/subcategories/:subcategoryId',
  isModeratorOrAdmin,
  deleteSubcategory
);


module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
// const { upload } = require('../config/cloudinary');
// const {
//   createCategory,
//   getCategories,
//   getCategoryById,
//   getCategoryWithProducts,
//   getCategoryProducts,
//   updateCategory,
//   deleteCategory
// } = require('../controllers/categoryController');

// // Public routes
// router.get('/', getCategories);
// router.get('/:id', getCategoryById);
// router.get('/:id/with-products', getCategoryWithProducts);
// router.get('/:id/products', getCategoryProducts);

// // Protected routes - All routes below require authentication
// router.use(protect);

// // Moderators and Admins can create categories
// router.post('/', 
//   isModeratorOrAdmin,
//   upload.single('image'), 
//   createCategory
// );

// // Moderators and Admins can update categories
// router.put('/:id', 
//   isModeratorOrAdmin,
//   upload.single('image'), 
//   updateCategory
// );

// // Only Admins can delete categories
// router.delete('/:id', 
//   isAdmin,
//   deleteCategory
// );

// module.exports = router;