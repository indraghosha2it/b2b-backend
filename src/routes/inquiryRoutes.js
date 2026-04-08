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

// Add this to your routes or create a new route file
router.get('/download/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    // Verify user has access to this file
    // You can check if the file belongs to an inquiry of this user
    
    const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment/${publicId}`;
    
    // Fetch the file from Cloudinary
    const response = await fetch(cloudinaryUrl);
    const buffer = await response.buffer();
    
    // Set correct headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${publicId.split('/').pop()}.pdf"`);
    res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, error: 'Download failed' });
  }
});

module.exports = router;