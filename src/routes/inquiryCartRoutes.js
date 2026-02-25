const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const uploadAttachment = require('../middleware/uploadAttachmentMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
   removeColorFromItem,
  clearCart,
  submitInquiry,
   uploadAttachment: uploadAttachmentController
} = require('../controllers/inquiryCartController');

// All routes require authentication
router.use(protect);

// Cart routes
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeFromCart);
router.delete('/item/:itemId/color/:colorIndex', removeColorFromItem);
router.delete('/clear', clearCart);

// Inquiry submission
router.post('/submit', submitInquiry);
// router.post('/upload', upload.single('attachment'), uploadAttachment);
// File upload route - with error handling
router.post('/upload', (req, res, next) => {
  console.log('📤 Upload request received');
  console.log('Content-Type:', req.headers['content-type']);
  
  uploadAttachment.single('attachment')(req, res, (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed'
      });
    }
    console.log('✅ File uploaded successfully:', req.file);
    next();
  });
}, uploadAttachmentController);

module.exports = router;