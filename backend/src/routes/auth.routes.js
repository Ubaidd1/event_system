const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updatePassword,
  getAllUsers,
  updateUserRole
} = require('../controllers/authController');
const { verifyJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.get('/me', verifyJWT, getCurrentUser);
router.put('/update-password', verifyJWT, updatePassword);

// User Management for Admin
router.get('/users', verifyJWT, authorizeRoles('Admin'), getAllUsers);
router.put('/users/:id/role', verifyJWT, authorizeRoles('Admin'), updateUserRole);

module.exports = router;
