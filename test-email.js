// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConnection() {
  console.log('📧 Testing email configuration...');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP Password:', process.env.SMTP_PASSWORD ? '✓ Set' : '✗ Missing');
  console.log('Owner Email:', process.env.OWNER_EMAIL);

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

  try {
    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: 'Test Email from B2B Platform',
      html: `
        <h1>Test Email</h1>
        <p>If you receive this, your email configuration is working!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox at:', process.env.OWNER_EMAIL || process.env.SMTP_USER);
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.response) console.error('Server response:', error.response);
  }
}

testEmailConnection();