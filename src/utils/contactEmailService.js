// utils/contactEmailService.js
const nodemailer = require('nodemailer');

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Contact Email Service - Configuration error:', error.message);
  } else {
    console.log('✅ Contact Email Service is ready');
    console.log(`📧 Using account: ${process.env.SMTP_USER}`);
  }
});

/**
 * Format date
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Generate inquiry type badge color
 */
const getInquiryTypeColor = (type) => {
  const colors = {
    wholesale: '#E39A65',
    custom: '#9C27B0',
    sample: '#2196F3',
    partnership: '#4CAF50',
    other: '#FF9800'
  };
  return colors[type] || '#E39A65';
};

/**
 * Generate inquiry type label
 */
const getInquiryTypeLabel = (type) => {
  const labels = {
    wholesale: 'Wholesale Inquiry',
    custom: 'Custom Manufacturing',
    sample: 'Sample Request',
    partnership: 'Partnership',
    other: 'Other'
  };
  return labels[type] || type;
};

/**
 * Send contact form submission emails (customer + admin)
 */
const sendContactFormEmails = async (formData) => {
  console.log('📧 Sending contact form emails...');
  console.log('📧 From:', formData.email);
  
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
    } = formData;

    if (!email) {
      throw new Error('Email is required');
    }

    const inquiryTypeColor = getInquiryTypeColor(inquiryType);
    const inquiryTypeLabel = getInquiryTypeLabel(inquiryType);
    const currentDate = formatDate(new Date());

    // 1. Send confirmation email to customer
    const customerTemplate = {
      subject: `📬 Thank You for Contacting Asian Clothify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
              padding: 25px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            }
            .header h1 span:first-child {
              font-size: 32px;
              line-height: 1;
            }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
              color: #333;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 10px;
            }
            .section-title span:first-child {
              font-size: 22px;
            }
            .info-box {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #E39A65;
            }
            .info-row {
              display: flex;
              margin-bottom: 12px;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            .info-label {
              width: 140px;
              font-weight: 600;
              color: #555;
            }
            .info-value {
              flex: 1;
              color: #333;
            }
            .message-box {
              background: #fff9f0;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #ffdbb5;
            }
            .inquiry-badge {
              display: inline-block;
              background: ${inquiryTypeColor};
              color: white;
              padding: 6px 15px;
              border-radius: 30px;
              font-size: 14px;
              font-weight: 600;
              margin: 10px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
            }
            .social-links {
              margin-top: 15px;
              text-align: center;
            }
            .social-link {
              display: inline-block;
              margin: 0 10px;
              color: #E39A65;
              text-decoration: none;
              font-size: 14px;
            }
            hr {
              border: none;
              border-top: 1px solid #eee;
              margin: 20px 0;
            }
            .quick-response {
              background: #e8f5e9;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>📬</span>
                <span>Thank You for Contacting Us</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="margin-bottom: 20px; font-size: 16px;">Dear <strong>${name}</strong>,</p>
              
              <p style="margin-bottom: 20px; font-size: 16px;">
                Thank you for reaching out to <strong>Asian Clothify</strong>. We have received your inquiry and will get back to you within <strong>2 hours</strong> during business hours.
              </p>

              <div class="quick-response">
                <p style="margin: 0; font-size: 16px;">
                  <span style="font-size: 20px; margin-right: 8px;">⏱️</span>
                  <strong>Response Time:</strong> Within 2 hours (Mon-Fri, 9AM-6PM BST)
                </p>
              </div>

              <div class="section-title">
                <span>📋</span>
                <span>Inquiry Summary</span>
              </div>
              
              <div class="info-box">
                <div class="info-row">
                  <div class="info-label">Inquiry Type:</div>
                  <div class="info-value">
                    <span class="inquiry-badge">${inquiryTypeLabel}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">Date & Time:</div>
                  <div class="info-value">${currentDate}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${name}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${email}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Phone:</div>
                  <div class="info-value">${phone}</div>
                </div>
                ${company ? `
                <div class="info-row">
                  <div class="info-label">Company:</div>
                  <div class="info-value">${company}</div>
                </div>
                ` : ''}
                ${country ? `
                <div class="info-row">
                  <div class="info-label">Country:</div>
                  <div class="info-value">${country}</div>
                </div>
                ` : ''}
                ${productInterest ? `
                <div class="info-row">
                  <div class="info-label">Product Interest:</div>
                  <div class="info-value">${productInterest}</div>
                </div>
                ` : ''}
              </div>

              <div class="section-title">
                <span>💬</span>
                <span>Your Message</span>
              </div>
              
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>

              <hr>

              <div class="section-title">
                <span>📞</span>
                <span>Need Faster Response?</span>
              </div>
              
              <p style="margin-bottom: 15px;">For immediate assistance, you can reach us through:</p>
              
              <div style="margin: 20px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 20px; margin-right: 12px;">📱</span>
                  <span><strong>WhatsApp:</strong> <a href="https://wa.me/8801305785685" style="color: #25D366; text-decoration: none;">+880 1305-785685</a></span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 20px; margin-right: 12px;">📞</span>
                  <span><strong>Phone:</strong> <a href="tel:+8801305785685" style="color: #333; text-decoration: none;">+880 1305-785685</a></span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 20px; margin-right: 12px;">📧</span>
                  <span><strong>Email:</strong> <a href="mailto:${process.env.SMTP_USER}" style="color: #E39A65; text-decoration: none;">${process.env.SMTP_USER}</a></span>
                </div>
              </div>

              <div class="social-links">
                <a href="https://facebook.com/asianclothify" class="social-link">Facebook</a> •
                <a href="https://instagram.com/asianclothify" class="social-link">Instagram</a> •
                <a href="https://asianclothify.com" class="social-link">Website</a>
              </div>
              
              <hr>
              
              <div class="footer">
                <p style="margin-bottom: 5px; font-size: 16px;">Best regards,</p>
                <p style="margin: 0; font-weight: bold; color: #E39A65; font-size: 16px;">The Asian Clothify Team</p>
                <p style="font-size: 13px; color: #999; margin-top: 15px;">
                  📧 ${process.env.SMTP_USER}<br>
                  49/10-C, Ground Floor, Genda, Savar, Dhaka, Bangladesh
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // 2. Send notification email to admin
    const adminTemplate = {
      subject: `📬 New Contact Form Submission - ${name} - ${inquiryTypeLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #E39A65 0%, #d48b54 100%);
              padding: 25px 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .content {
              padding: 35px 30px;
              text-align: left;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 25px 0 15px 0;
              display: flex;
              align-items: center;
              gap: 8px;
              color: #333;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 10px;
            }
            .section-title span:first-child {
              font-size: 22px;
            }
            .info-grid {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .info-row {
              display: flex;
              margin-bottom: 12px;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            .info-label {
              width: 140px;
              font-weight: 600;
              color: #555;
            }
            .info-value {
              flex: 1;
              color: #333;
            }
            .message-box {
              background: #fff9f0;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #ffdbb5;
            }
            .inquiry-badge {
              display: inline-block;
              background: ${inquiryTypeColor};
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .action-buttons {
              margin: 30px 0;
              text-align: center;
            }
            .button {
              background: #E39A65;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
              font-weight: bold;
              font-size: 15px;
              margin: 0 10px;
              border: 1px solid #E39A65;
            }
            .button-outline {
              background: white;
              color: #E39A65;
              border: 1px solid #E39A65;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: left;
              font-size: 13px;
              color: #666;
            }
            hr {
              border: none;
              border-top: 1px solid #eee;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                <span>📬</span>
                <span>New Contact Form Submission</span>
              </h1>
            </div>
            
            <div class="content">
              <p style="margin-bottom: 20px; font-size: 16px;">
                A new contact form has been submitted on <strong>${currentDate}</strong>.
              </p>

              <div class="section-title">
                <span>👤</span>
                <span>Contact Information</span>
              </div>
              
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Inquiry Type:</div>
                  <div class="info-value">
                    <span class="inquiry-badge">${inquiryTypeLabel}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value"><strong>${name}</strong></div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value"><a href="mailto:${email}" style="color: #E39A65;">${email}</a></div>
                </div>
                <div class="info-row">
                  <div class="info-label">Phone:</div>
                  <div class="info-value"><a href="tel:${phone}" style="color: #333;">${phone}</a></div>
                </div>
                ${company ? `
                <div class="info-row">
                  <div class="info-label">Company:</div>
                  <div class="info-value">${company}</div>
                </div>
                ` : ''}
                ${country ? `
                <div class="info-row">
                  <div class="info-label">Country:</div>
                  <div class="info-value">${country}</div>
                </div>
                ` : ''}
                ${productInterest ? `
                <div class="info-row">
                  <div class="info-label">Product Interest:</div>
                  <div class="info-value">${productInterest}</div>
                </div>
                ` : ''}
              </div>

              <div class="section-title">
                <span>💬</span>
                <span>Message</span>
              </div>
              
              <div class="message-box">
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>

              <hr>

              <div class="section-title">
                <span>⚡</span>
                <span>Quick Actions</span>
              </div>

              <div class="action-buttons">
                <a href="mailto:${email}" class="button button-outline" style="margin-bottom: 10px;">📧 Reply via Email</a>
                <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" class="button" style="margin-bottom: 10px;">📱 WhatsApp Reply</a>
              </div>

              <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>💡 Tip:</strong> Response time target: < 2 hours
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 0;">This is an automated notification from your website contact form.</p>
                <p style="margin: 5px 0 0 0;">To respond to this inquiry, please use the links above or your email client.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send to customer
    const customerResult = await transporter.sendMail({
      from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
      to: email,
      subject: customerTemplate.subject,
      html: customerTemplate.html
    });
    console.log('✅ Customer contact confirmation email sent:', customerResult.messageId);

    // Send to admin
    const adminResult = await transporter.sendMail({
      from: `"Asian Clothify Contact" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: adminTemplate.subject,
      html: adminTemplate.html
    });
    console.log('✅ Admin contact notification email sent:', adminResult.messageId);

    return { success: true };
  } catch (error) {
    console.error('❌ Contact form email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactFormEmails
};