// utils/forgetPasswordOtpService.js
const nodemailer = require('nodemailer');

// Validate environment variables
const requiredEnvVars = ['INFO_SMTP_USER', 'INFO_SMTP_PASSWORD', 'INFO_SMTP_HOST', 'INFO_SMTP_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please check your .env file');
  }
}

// Create transporter for Hostinger SMTP (port 465 with SSL)
const transporter = nodemailer.createTransport({
  host: process.env.INFO_SMTP_HOST,
  port: parseInt(process.env.INFO_SMTP_PORT) || 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.INFO_SMTP_USER,
    pass: process.env.INFO_SMTP_PASSWORD
  },
  // Add TLS options for Hostinger
  tls: {
    rejectUnauthorized: false // Only for development, remove in production
  },
  // Add this for better debugging
  debug: true,
  logger: true
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email server connection error:', error);
    console.error('Please check your SMTP credentials in .env file');
  } else {
    console.log('✅ Forget Password Email Service is ready');
    console.log(`📧 Connected to: ${process.env.INFO_SMTP_HOST}`);
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send password reset OTP email
const sendPasswordResetOTP = async (email, otp, userName) => {
  // Validate email credentials first
  if (!process.env.INFO_SMTP_USER || !process.env.INFO_SMTP_PASSWORD) {
    throw new Error('Email credentials not configured. Please check your .env file.');
  }

  const mailOptions = {
    from: `"AsianClothify Support" <${process.env.INFO_SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Request - AsianClothify',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d9884e 0%, #e6a87c 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AsianClothify</h1>
            <p style="color: #ffffff; margin: 10px 0 0; opacity: 0.9;">B2B Wholesale Marketplace</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin-top: 0;">Hello, ${userName}!</h2>
            
            <p style="color: #666666; line-height: 1.6;">We received a request to reset your password for your AsianClothify account. Use the OTP below to complete the password reset process:</p>
            
            <!-- OTP Box -->
            <div style="background-color: #f8f9fa; border: 2px dashed #d9884e; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="font-size: 48px; letter-spacing: 10px; color: #d9884e; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="color: #666666; line-height: 1.6;">This OTP is valid for <strong style="color: #d9884e;">10 minutes</strong>.</p>
            
            <div style="background-color: #fff3e0; border-left: 4px solid #d9884e; padding: 15px; margin: 30px 0;">
              <p style="color: #666666; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately. Your account security is important to us.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} AsianClothify. All rights reserved.<br>
              <a href="https://asianclothify.com" style="color: #d9884e; text-decoration: none;">www.asianclothify.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Plain text version
    text: `
      Hello ${userName},
      
      We received a request to reset your password for your AsianClothify account.
      
      Your password reset OTP is: ${otp}
      
      This OTP is valid for 10 minutes.
      
      If you didn't request this password reset, please ignore this email or contact our support team immediately.
      
      Visit us at: https://asianclothify.com
    `
  };

  try {
    console.log(`📧 Attempting to send password reset OTP to: ${email}`);
    console.log(`📧 Using SMTP server: ${process.env.INFO_SMTP_HOST}:${process.env.INFO_SMTP_PORT}`);
    console.log(`📧 From: ${process.env.INFO_SMTP_USER}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent successfully to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    
    return true;
  } catch (error) {
    console.error('❌ Password reset email send error details:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your SMTP username and password.');
    } else if (error.code === 'ESOCKET') {
      throw new Error(`Could not connect to SMTP server ${process.env.INFO_SMTP_HOST}:${process.env.INFO_SMTP_PORT}. Please check your network and firewall settings.`);
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Connection to SMTP server timed out. Please check your network.');
    } else {
      throw new Error(`Failed to send password reset OTP: ${error.message}`);
    }
  }
};

module.exports = {
  generateOTP,
  sendPasswordResetOTP
};