// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { sendContactFormEmails } = require('../utils/contactEmailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      country,
      inquiryType,
      message,
      productInterest
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, phone and message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Send emails
    const result = await sendContactFormEmails({
      name,
      email,
      phone,
      company,
      country,
      inquiryType: inquiryType || 'wholesale',
      message,
      productInterest
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send message'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you within 2 hours.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router;