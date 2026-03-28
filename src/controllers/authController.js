const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // ADDED MISSING IMPORT
const { generateOTP, sendOTPEmail } = require('../utils/emailOtpService');
const { generateOTP: generateResetOTP, sendPasswordResetOTP } = require('../utils/forgetPasswordOtpService');
// Add these imports at the top
const admin = require('../config/firebaseAdmin');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role,
      companyName: user.companyName
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate email verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// const registerUser = async (req, res) => {
//   try {
//     console.log('📝 Registration request received');

//     const {
//       companyName,
//       contactPerson,
//       email,
//       phone,
//       whatsapp,
//       country,
//       address,
//       city,
//       zipCode,
//       role,
//       password,
//       businessType
//     } = req.body;

//     // Validate required fields
//     const missingFields = [];
//     if (!companyName) missingFields.push('companyName');
//     if (!contactPerson) missingFields.push('contactPerson');
//     if (!email) missingFields.push('email');
//     if (!phone) missingFields.push('phone');
//     if (!country) missingFields.push('country');
//     if (!address) missingFields.push('address');
//     if (!city) missingFields.push('city');
//     if (!zipCode) missingFields.push('zipCode');
//     if (!password) missingFields.push('password');

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         error: `Missing required fields: ${missingFields.join(', ')}`
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide a valid email address'
//       });
//     }

//     // Validate password strength
//     if (password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         error: 'Password must be at least 8 characters long'
//       });
//     }

//     // Check if user already exists
//     const userExists = await User.findOne({ email: email.toLowerCase() });
//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         error: 'User with this email already exists'
//       });
//     }

//     // HASH PASSWORD HERE
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create verification token
//     const verificationToken = generateVerificationToken();

//     // Create new user with hashed password
//     const user = new User({
//       companyName,
//       contactPerson,
//       email: email.toLowerCase(),
//       phone,
//       whatsapp: whatsapp || '',
//       country,
//       address,
//       city,
//       zipCode,
//       role: role || 'customer',
//       password: hashedPassword, // Use pre-hashed password
//       businessType: businessType || 'Retailer',
//       emailVerificationToken: verificationToken,
//       loginCount: 0,
//       isActive: true,
//       emailVerified: false
//     });

//     // Save user
//     await user.save();

//     console.log('✅ User created successfully:', user._id);

//     // Generate token
//     const token = generateToken(user);

//     res.status(201).json({
//       success: true,
//       message: 'Registration successful! Please verify your email.',
//       token,
//       user: user.toJSON()
//     });

//   } catch (error) {
//     console.error('❌ Registration error:', error);
    
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error: 'Email already exists'
//       });
//     }

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(val => val.message);
//       return res.status(400).json({
//         success: false,
//         error: messages.join(', ')
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error during registration'
//     });
//   }
// };


// @desc    Register a new user (Step 1: Send OTP)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('📝 Registration request received');

    const {
      companyName,
      contactPerson,
      email,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      role,
      password,
      businessType
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!companyName) missingFields.push('companyName');
    if (!contactPerson) missingFields.push('contactPerson');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!country) missingFields.push('country');
    if (!address) missingFields.push('address');
    if (!city) missingFields.push('city');
    if (!zipCode) missingFields.push('zipCode');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
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

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      // If user exists but not verified, delete old record
      if (userExists.registrationStatus === 'pending') {
        await User.deleteOne({ _id: userExists._id });
        console.log('🗑️ Deleted unverified user:', email);
      } else {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with pending status
    const user = new User({
      companyName,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      whatsapp: whatsapp || '',
      country,
      address,
      city,
      zipCode,
      role: role || 'customer',
      password: hashedPassword,
      businessType: businessType || 'Retailer',
      isActive: false,
      emailVerified: false,
      registrationStatus: 'pending',
      otp: otp,
      otpExpiry: otpExpiry
    });

    // Save user
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, companyName);
    } catch (emailError) {
      // If email fails, delete the user and return error
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again.'
      });
    }

    console.log('✅ OTP sent successfully to:', email);

    res.status(201).json({
      success: true,
      message: 'Registration initiated! Please verify your email with the OTP sent.',
      email: email,
      requiresOTP: true
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration'
    });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP'
      });
    }

    // Find user with pending status
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      registrationStatus: 'pending'
    }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request or user already verified'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiry < new Date()) {
      // Delete expired user
      await User.deleteOne({ _id: user._id });
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please register again.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Update user status
    user.isActive = true;
    user.emailVerified = true;
    user.registrationStatus = 'completed';
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        companyName: user.companyName
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Email verified successfully for:', email);

    res.json({
      success: true,
      message: 'Email verified successfully! Registration complete.',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      registrationStatus: 'pending'
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'No pending registration found for this email'
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new OTP
    user.otp = newOTP;
    user.otpExpiry = newExpiry;
    await user.save();

    // Send new OTP email
    await sendOTPEmail(email, newOTP, user.companyName);

    console.log('✅ New OTP sent to:', email);

    res.json({
      success: true,
      message: 'New OTP sent successfully'
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend OTP'
    });
  }
};

// Update loginUser to check verification status
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.emailVerified || user.registrationStatus !== 'completed') {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        companyName: user.companyName
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};



// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log('🔐 Login attempt for email:', email);

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide email and password'
//       });
//     }

//     // Find user by email and include password field
//     const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

//     if (!user) {
//       console.log('❌ User not found:', email);
//       return res.status(401).json({
//         success: false,
//         error: 'Invalid credentials'
//       });
//     }

//     // Check if user is active
//     if (!user.isActive) {
//       console.log('❌ Account deactivated:', email);
//       return res.status(401).json({
//         success: false,
//         error: 'Account is deactivated. Please contact support.'
//       });
//     }

//     // Check password
//     const isPasswordMatch = await user.comparePassword(password);
//     if (!isPasswordMatch) {
//       console.log('❌ Invalid password for:', email);
//       return res.status(401).json({
//         success: false,
//         error: 'Invalid credentials'
//       });
//     }

//     // Update last login
//     user.lastLogin = new Date();
//     user.loginCount += 1;
//     await user.save();

//     // Generate token
//     const token = generateToken(user);

//     console.log('✅ Login successful for:', email);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: user.toJSON()
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error during login'
//     });
//   }
// };

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// const updateProfile = async (req, res) => {
//   try {
//     const updates = {};
//     const allowedUpdates = [
//       'companyName', 
//       'contactPerson', 
//       'phone', 
//       'whatsapp', 
//       'country', 
//       'address', 
//       'city', 
//       'zipCode', 
//       'businessType',
//       'notificationPreferences'
//     ];
    
//     allowedUpdates.forEach(field => {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     });

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       updates,
//       { new: true, runValidators: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: user.toJSON()
//     });

//   } catch (error) {
//     console.error('❌ Update profile error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = [
      'companyName', 
      'contactPerson', 
      'phone', 
      'whatsapp', 
      'country', 
      'address', 
      'city', 
      'zipCode', 
      'businessType',
      'timezone',
      'notificationPreferences'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Get the user first
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if this is a Google user completing profile
    const isGoogleUser = user.authProvider === 'google';
    
    // Apply updates to the user document
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    // If this is a Google user and all required fields are now filled,
    // mark profile as completed
    if (isGoogleUser) {
      const requiredFields = ['country', 'address', 'city', 'zipCode', 'phone'];
      const allFieldsFilled = requiredFields.every(field => 
        user[field] && user[field] !== 'TBD' && user[field].trim() !== ''
      );
      
      if (allFieldsFilled) {
        user.profileCompleted = true;
      }
    }

    // Save the user with validation disabled for Google users
    const saveOptions = isGoogleUser ? { validateBeforeSave: false } : {};
    await user.save(saveOptions);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         error: 'Please provide current password and new password'
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         success: false,
//         error: 'New password must be at least 8 characters long'
//       });
//     }

//     // Get user with password
//     const user = await User.findById(req.user.id).select('+password');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }

//     // Verify current password
//     const isMatch = await user.comparePassword(currentPassword);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         error: 'Current password is incorrect'
//       });
//     }

//     // Update password
//     user.password = newPassword;
//     await user.save();

//     res.json({
//       success: true,
//       message: 'Password changed successfully'
//     });

//   } catch (error) {
//     console.error('❌ Change password error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // IMPORTANT: Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password with hashed version
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};



// Update your forgotPassword function to use the new service
// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email'
      });
    }

    // Generate OTP using the aliased reset OTP generator
    const otp = generateResetOTP(); // This uses forgetPasswordOtpService
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    // Send password reset OTP email using the dedicated service
    try {
      await sendPasswordResetOTP(email, otp, user.contactPerson || user.companyName || 'User');
    } catch (emailError) {
      // Clear OTP if email fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email. Please try again.'
      });
    }

    console.log('✅ Password reset OTP sent to:', email);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email',
      email: email
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase()
    }).select('+resetPasswordOTP +resetPasswordOTPExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if OTP exists and is not expired
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        error: 'No reset request found. Please request again.'
      });
    }

    // Check if OTP is expired
    if (user.resetPasswordOTPExpiry < new Date()) {
      // Clear expired OTP
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;
      await user.save();
      
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request again.'
      });
    }

    // Verify OTP
    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // OTP is valid - keep it for password reset
    console.log('✅ Password reset OTP verified for:', email);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      email: user.email
    });

  } catch (error) {
    console.error('❌ Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
// In your authController.js
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    console.log('Reset password request received:', { email, otp, password: '***' });

    if (!email || !otp || !password) {
      console.log('Missing fields:', { email: !!email, otp: !!otp, password: !!password });
      return res.status(400).json({
        success: false,
        error: 'Please provide email, OTP and new password'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase()
    }).select('+resetPasswordOTP +resetPasswordOTPExpiry +password');

    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('User found:', user.email);
    console.log('Stored OTP:', user.resetPasswordOTP);
    console.log('Received OTP:', otp);
    console.log('OTP Expiry:', user.resetPasswordOTPExpiry);

    // Verify OTP
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      console.log('OTP mismatch');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please request again.'
      });
    }

    // Check if OTP is expired
    if (user.resetPasswordOTPExpiry < new Date()) {
      console.log('OTP expired');
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request again.'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();

    console.log('✅ Password reset successful for:', email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};



// @desc    Google Login/Signup
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid, email_verified } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - check if this is first Google login
      if (!user.firebaseUid) {
        // Link Google account to existing user
        user.firebaseUid = uid;
        user.authProvider = 'google';
        user.emailVerified = user.emailVerified || email_verified;
        await user.save();
      }
    } else {
      // Create new user from Google data
      const nameParts = name ? name.split(' ') : ['', ''];
      const contactPerson = name || email.split('@')[0];
      
      // Generate a random password (user will never use it)
      const randomPassword = Math.random().toString(36).slice(-16);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        companyName: req.body.companyName || `${contactPerson}'s Company`, // They can update later
        contactPerson: contactPerson,
        email: email.toLowerCase(),
        phone: '', // Will need to be filled later
        whatsapp: '',
        country: '', // Will need to be filled later
        address: '',
        city: '',
        zipCode: '',
        role: 'customer',
        password: hashedPassword,
        businessType: 'Retailer',
        isActive: true,
        emailVerified: email_verified,
        registrationStatus: 'completed',
        firebaseUid: uid,
        authProvider: 'google',
        profilePicture: picture || ''
      });

      await user.save();
    }

    // Generate JWT token for your app
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        companyName: user.companyName
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Check if profile is complete (needs additional info)
    const isProfileComplete = !!(user.country && user.address && user.city && user.zipCode && user.phone);

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: user.toJSON(),
      isProfileComplete,
      requiresAdditionalInfo: !isProfileComplete
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Google token expired'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
};

// @desc    Complete profile after Google signup
// @route   POST /api/auth/complete-profile
// @access  Private
const completeProfile = async (req, res) => {
  try {
    const {
      companyName,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      businessType
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!companyName) missingFields.push('companyName');
    if (!phone) missingFields.push('phone');
    if (!country) missingFields.push('country');
    if (!address) missingFields.push('address');
    if (!city) missingFields.push('city');
    if (!zipCode) missingFields.push('zipCode');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user profile
    user.companyName = companyName;
    user.phone = phone;
    user.whatsapp = whatsapp || '';
    user.country = country;
    user.address = address;
    user.city = city;
    user.zipCode = zipCode;
    user.businessType = businessType || user.businessType;

    await user.save();

    res.json({
      success: true,
      message: 'Profile completed successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Complete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete profile'
    });
  }
};
// @desc    Google Signup (for new users)
// @route   POST /api/auth/google-signup
// @access  Public
const googleSignup = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid, email_verified } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User already exists - should login instead
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please login instead.',
        existingUser: true
      });
    }

    // Create new user from Google data
    const nameParts = name ? name.split(' ') : ['', ''];
    const contactPerson = name || email.split('@')[0];
    
    // Generate a random password (user will never use it)
    const randomPassword = Math.random().toString(36).slice(-16);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    user = new User({
      companyName: `${contactPerson}'s Company`, // Placeholder
      contactPerson: contactPerson,
      email: email.toLowerCase(),
      phone: '', // Will be filled in complete-profile
      whatsapp: '',
      country: '', // Will be filled in complete-profile
      address: '',
      city: '',
      zipCode: '',
      role: 'customer',
      password: hashedPassword,
      businessType: 'Retailer',
      isActive: true,
      emailVerified: email_verified,
      registrationStatus: 'completed',
      firebaseUid: uid,
      authProvider: 'google',
      profilePicture: picture || ''
    });

    await user.save();

    // Generate JWT token for your app
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        companyName: user.companyName
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Check if profile is complete (needs additional info)
    const isProfileComplete = !!(user.country && user.address && user.city && user.zipCode && user.phone);

    res.status(201).json({
      success: true,
      message: 'Google signup successful',
      token,
      user: user.toJSON(),
      isNewUser: true,
      requiresAdditionalInfo: !isProfileComplete
    });

  } catch (error) {
    console.error('❌ Google signup error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Google token expired'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Google signup failed'
    });
  }
};



// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// EXPORT ALL FUNCTIONS
module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyResetOTP,
    googleAuth,
  completeProfile,
  googleSignup,
  logoutUser
};