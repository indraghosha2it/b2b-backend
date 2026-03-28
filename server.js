const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const inquiryCartRoutes = require('./src/routes/inquiryCartRoutes');
const inquiryRoutes = require('./src/routes/inquiryRoutes'); // ADD THIS
const adminInquiryRoutes = require('./src/routes/adminInquiryRoutes'); // ADD THIS
const uploadRoutes = require('./src/routes/uploadRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes'); 
const blogRoutes = require('./src/routes/blogRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const moderatorInquiryRoutes = require('./src/routes/moderatorInquiryRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

// Initialize Express app
const app = express();

// Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://radiant-sunburst-ded7d3.netlify.app',
  process.env.FRONTEND_URL // Keep this for flexibility
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers - ADD THESE FIRST
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ADD THIS JSON SYNTAX ERROR HANDLER - Place it after body parsers but before routes
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON Syntax Error:', err.message);
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid JSON payload. Please check your request format.' 
    });
  }
  next();
});


// MongoDB Connection - REMOVED deprecated options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/products', productRoutes); 
app.use('/uploads', express.static('uploads'));
app.use('/api/inquiry-cart', inquiryCartRoutes);
app.use('/api/inquiries', inquiryRoutes); // ADD THIS - Customer inquiry routes
app.use('/api/admin/inquiries', adminInquiryRoutes); // ADD THIS - Admin inquiry routes
app.use('/api/upload', uploadRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/moderator/inquiries', moderatorInquiryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/contact', contactRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    database: mongoose.connection.name
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});