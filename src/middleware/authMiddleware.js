const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token and add user to request
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-secret-key-change-this'
      );

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Authorize by roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

// Check if user is moderator or admin
const isModeratorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Moderator or admin access required'
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  isAdmin,
  isModeratorOrAdmin
};