// // controllers/adminController.js
// const User = require('../models/User');

// // @desc    Get all users (admin only)
// // @route   GET /api/admin/users
// // @access  Private/Admin
// const getUsers = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, role = '', search = '' } = req.query;
    
//     // Build filter
//     let filter = { role: { $in: ['admin', 'moderator'] } };
    
//     if (role) {
//       filter.role = role;
//     }
    
//     if (search) {
//       filter.$or = [
//         { contactPerson: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     // Count total documents
//     const total = await User.countDocuments(filter);
    
//     // Get users
//     const users = await User.find(filter)
//       .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);
    
//     res.json({
//       success: true,
//       users,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
    
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// // @desc    Update user
// // @route   PUT /api/admin/users/:id
// // @access  Private/Admin
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { contactPerson, email, phone, whatsapp, role } = req.body;
    
//     const user = await User.findById(id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }
    
//     // Update fields
//     if (contactPerson) user.contactPerson = contactPerson;
//     if (email) user.email = email;
//     if (phone) user.phone = phone;
//     if (whatsapp !== undefined) user.whatsapp = whatsapp;
//     if (role) user.role = role;
    
//     await user.save();
    
//     res.json({
//       success: true,
//       message: 'User updated successfully',
//       user: user.toJSON()
//     });
    
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// // @desc    Delete user
// // @route   DELETE /api/admin/users/:id
// // @access  Private/Admin
// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Prevent deleting yourself
//     if (id === req.user.id) {
//       return res.status(400).json({
//         success: false,
//         error: 'You cannot delete your own account'
//       });
//     }
    
//     const user = await User.findById(id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }
    
//     await user.deleteOne();
    
//     res.json({
//       success: true,
//       message: 'User deleted successfully'
//     });
    
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };


// // controllers/adminController.js - Add these functions

// // @desc    Get all customers
// // @route   GET /api/admin/customers
// // @access  Private/Admin
// const getCustomers = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = '', country = '', businessType = '' } = req.query;
    
//     // Build filter for customers only
//     let filter = { role: 'customer' };
    
//     if (country) {
//       filter.country = country;
//     }
    
//     if (businessType) {
//       filter.businessType = businessType;
//     }
    
//     if (search) {
//       filter.$or = [
//         { companyName: { $regex: search, $options: 'i' } },
//         { contactPerson: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     // Count total documents
//     const total = await User.countDocuments(filter);
    
//     // Get customers
//     const customers = await User.find(filter)
//       .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);
    
//     res.json({
//       success: true,
//       customers,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
    
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// // @desc    Delete customer
// // @route   DELETE /api/admin/customers/:id
// // @access  Private/Admin
// const deleteCustomer = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const user = await User.findById(id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'Customer not found'
//       });
//     }
    
//     // Check if it's a customer
//     if (user.role !== 'customer') {
//       return res.status(400).json({
//         success: false,
//         error: 'Can only delete customer accounts'
//       });
//     }
    
//     await user.deleteOne();
    
//     res.json({
//       success: true,
//       message: 'Customer deleted successfully'
//     });
    
//   } catch (error) {
//     console.error('Error deleting customer:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// module.exports = {
//   getUsers,
//   updateUser,
//   deleteUser,
//   getCustomers,  // Add this
//   deleteCustomer // Add this
// };


const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', country = '', businessType = '' } = req.query;
    
    // Build filter for customers only
    let filter = { role: 'customer' };
    
    if (country) {
      filter.country = country;
    }
    
    if (businessType) {
      filter.businessType = businessType;
    }
    
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await User.countDocuments(filter);
    
    // Get customers
    const customers = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.json({
      success: true,
      customers,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    // Check if it's a customer
    if (user.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'Can only delete customer accounts'
      });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = '', search = '' } = req.query;
    
    // Build filter
    let filter = { role: { $in: ['admin', 'moderator'] } };
    
    if (role) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await User.countDocuments(filter);
    
    // Get users
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};


// @desc    Create a new admin/moderator user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const {
      contactPerson,
      email,
      phone,
      whatsapp,
      role,
      password,
      companyName,
      country,
      address,
      city,
      zipCode,
      businessType
    } = req.body;

    console.log('📝 Admin creating new user:', { email, role });

    // Validate required fields
    if (!contactPerson || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contactPerson, email, phone, password, and role are required'
      });
    }

    // Validate role
    if (!['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either admin or moderator'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (auto-verified for admin-created users)
    const user = new User({
      companyName: companyName || contactPerson,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      whatsapp: whatsapp || '',
      country: country || 'Not Specified',
      address: address || 'Not Specified',
      city: city || 'Not Specified',
      zipCode: zipCode || 'Not Specified',
      role,
      password: hashedPassword,
      businessType: businessType || 'Other',
      // Admin created users are automatically verified
      isActive: true,
      emailVerified: true,
      registrationStatus: 'completed',
      // Track who created this user
      createdBy: req.user._id
    });

    await user.save();

    console.log('✅ User created successfully by admin:', user._id);

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: `${role === 'admin' ? 'Admin' : 'Moderator'} user created successfully`,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

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
      error: 'Failed to create user. Please try again.'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactPerson, email, phone, whatsapp, role } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields
    if (contactPerson) user.contactPerson = contactPerson;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (whatsapp !== undefined) user.whatsapp = whatsapp;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
// Add these functions to your existing adminController.js (before module.exports)

// @desc    Update customer (Admin only)
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Fields that can be updated
    const allowedUpdates = [
      'companyName', 'contactPerson', 'phone', 'whatsapp', 
      'country', 'address', 'city', 'zipCode', 'businessType', 'isActive'
    ];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

// @desc    Reset customer password (Admin only)
// @route   PUT /api/admin/customers/:id/reset-password
// @access  Private/Admin
const resetCustomerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const user = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};



module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCustomers,
  deleteCustomer,
    updateCustomer,        // Add this
  resetCustomerPassword 
};