// src/routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Just protect
const { submitInquiry,
     getMyInquiries,
  getInquiryById,
  cancelInquiry,
   acceptQuote
 } = require('../controllers/inquiryController');


// All routes require authentication (any role)
router.use(protect);

router.post('/submit', submitInquiry);
router.get('/my-inquiries', getMyInquiries);
router.get('/:id', getInquiryById);
router.put('/:id/cancel', cancelInquiry);
router.put('/:id/accept', acceptQuote);

module.exports = router;