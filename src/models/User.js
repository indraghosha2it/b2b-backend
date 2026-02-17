// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   companyName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   contactPerson: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   phone: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   whatsapp: {
//     type: String,
//     trim: true,
//     default: ''
//   },
//   country: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   address: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   city: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   zipCode: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'moderator', 'customer'],
//     default: 'customer'
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   businessType: {
//     type: String,
//     enum: ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'E-commerce', 'Boutique', 'Other'],
//     default: 'Retailer'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   emailVerified: {
//     type: Boolean,
//     default: false
//   },
//   emailVerificationToken: String,
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
//   lastLogin: {
//     type: Date,
//     default: null
//   },
//   loginCount: {
//     type: Number,
//     default: 0
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   timezone: {
//     type: String,
//     default: 'UTC'
//   },
//   notificationPreferences: {
//     email: { type: Boolean, default: true },
//     sms: { type: Boolean, default: false },
//     whatsapp: { type: Boolean, default: false }
//   }
// }, {
//   timestamps: true
// });

// // COMPLETELY REWRITTEN PRE-SAVE HOOK - USING FUNCTION DECLARATION
// userSchema.pre('save', function(next) {
//   const user = this;
  
//   // Only hash the password if it's modified
//   if (!user.isModified('password')) {
//     return next();
//   }

//   // Generate salt and hash
//   bcrypt.genSalt(10, function(err, salt) {
//     if (err) return next(err);
    
//     bcrypt.hash(user.password, salt, function(err, hash) {
//       if (err) return next(err);
      
//       // Replace password with hash
//       user.password = hash;
//       next();
//     });
//   });
// });

// // Compare password method - using async/await but with proper error handling
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// // Remove password from JSON response
// userSchema.methods.toJSON = function() {
//   const userObject = this.toObject();
//   delete userObject.password;
//   delete userObject.resetPasswordToken;
//   delete userObject.resetPasswordExpires;
//   delete userObject.emailVerificationToken;
//   return userObject;
// };

// // Update last login
// userSchema.methods.updateLastLogin = async function() {
//   this.lastLogin = new Date();
//   this.loginCount += 1;
//   return this.save();
// };

// const User = mongoose.model('User', userSchema);
// module.exports = User;


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'customer'],
    default: 'customer'
  },
  password: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    enum: ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'E-commerce', 'Boutique', 'Other'],
    default: 'Retailer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// REMOVE THE PRE-SAVE HOOK COMPLETELY
// We'll hash passwords in the controller

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;