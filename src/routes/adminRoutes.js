// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { 
  getUsers, 
  updateUser, 
  deleteUser,
  getCustomers,  // Add this
  deleteCustomer // Add this
} = require('../controllers/adminController');
// All routes are protected and require admin role
router.use(protect, isAdmin);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);


// Customer management routes
router.get('/customers', getCustomers);
router.delete('/customers/:id', deleteCustomer);
module.exports = router;