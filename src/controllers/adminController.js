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

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getCustomers,
  deleteCustomer
};