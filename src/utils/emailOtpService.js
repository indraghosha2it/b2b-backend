// utils/emailOtpService.js
const nodemailer = require('nodemailer');

// Validate environment variables
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASSWORD', 'SMTP_HOST', 'SMTP_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.error('Please check your .env file');
  }
}

// Create transporter for Hostinger SMTP (port 465 with SSL)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
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
    console.log('✅ Email server is ready to send messages');
    console.log(`📧 Connected to: ${process.env.SMTP_HOST}`);
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, companyName) => {
  // Validate email credentials first
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('Email credentials not configured. Please check your .env file.');
  }

  const mailOptions = {
    from: `"Asian Clothify" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - Asian Clothify',
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
            <p style="color: #ffffff; margin: 10px 0 0; opacity: 0.9;">Wholesale Marketplace</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin-top: 0;">Welcome, ${companyName}!</h2>
            
            <p style="color: #666666; line-height: 1.6;">Thank you for registering with AsianClothify. To complete your registration, please verify your email address using the OTP below:</p>
            
            <!-- OTP Box -->
            <div style="background-color: #f8f9fa; border: 2px dashed #d9884e; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
              <h1 style="font-size: 48px; letter-spacing: 10px; color: #d9884e; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            
            <p style="color: #666666; line-height: 1.6;">This OTP is valid for <strong style="color: #d9884e;">10 minutes</strong>.</p>
            
            <div style="background-color: #fff3e0; border-left: 4px solid #d9884e; padding: 15px; margin: 30px 0;">
              <p style="color: #666666; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> If you didn't request this registration, please ignore this email. Your account will not be activated without verification.
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
      Welcome to AsianClothify, ${companyName}!
      
      Thank you for registering. Please verify your email address using this OTP: ${otp}
      
      This OTP is valid for 10 minutes.
      
      If you didn't request this registration, please ignore this email.
      
      Visit us at: https://asianclothify.com
    `
  };

  try {
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    console.log(`📧 Using SMTP server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`📧 From: ${process.env.SMTP_USER}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    
    return true;
  } catch (error) {
    console.error('❌ Email send error details:', {
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
      throw new Error(`Could not connect to SMTP server ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Please check your network and firewall settings.`);
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Connection to SMTP server timed out. Please check your network.');
    } else {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};