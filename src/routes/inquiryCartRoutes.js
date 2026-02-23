const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  submitInquiry,
  uploadAttachment
} = require('../controllers/inquiryCartController');

// All routes require authentication
router.use(protect);

// Cart routes
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeFromCart);
router.delete('/clear', clearCart);

// Inquiry submission
router.post('/submit', submitInquiry);
router.post('/upload', upload.single('attachment'), uploadAttachment);

module.exports = router;