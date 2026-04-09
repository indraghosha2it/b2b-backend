// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { 
  getUsers, 
  updateUser, 
  deleteUser,
  getCustomers,  // Add this
  deleteCustomer ,
  createUser,// Add this
   updateCustomer,        // Add this
  resetCustomerPassword  // Add this
} = require('../controllers/adminController');
// All routes are protected and require admin role
router.use(protect, isAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);


// Customer management routes
router.get('/customers', getCustomers);
router.put('/customers/:id', updateCustomer);                    // Edit customer
router.put('/customers/:id/reset-password', resetCustomerPassword); // Reset password
router.delete('/customers/:id', deleteCustomer);
module.exports = router;