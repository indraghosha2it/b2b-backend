// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { uploadProduct } = require('../config/cloudinary'); // Use uploadProduct which is a multer instance
const {
  createBlog,
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  getBlogForEdit,
  updateBlog,
  deleteBlog,
  toggleBlogStatus
} = require('../controllers/blogController');

// ========== PUBLIC ROUTES ==========
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// ========== PROTECTED ROUTES (All require authentication) ==========
router.use(protect);

// ========== ADMIN/MODERATOR ROUTES ==========
router.get('/admin/all', isModeratorOrAdmin, getAllBlogsAdmin);
router.get('/admin/:id', isModeratorOrAdmin, getBlogForEdit);

// Create blog - with file uploads
router.post('/',
  isModeratorOrAdmin,
  uploadProduct.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'thumbnailImages', maxCount: 10 },
    { name: 'paragraphImages', maxCount: 20 }
  ]),
  createBlog
);

// Update blog
router.put('/admin/:id',
  isModeratorOrAdmin,
  uploadProduct.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'thumbnailImages', maxCount: 10 },
    { name: 'paragraphImages', maxCount: 20 }
  ]),
  updateBlog
);

// ========== ADMIN ONLY ROUTES ==========
router.delete('/admin/:id', isAdmin, deleteBlog);
router.put('/admin/:id/toggle', isAdmin, toggleBlogStatus);

module.exports = router;