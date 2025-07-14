const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  getCurrentUser,
  logoutUser,
  sessionStatus
} = require('../controllers/authController');
const { protectSession } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/session', sessionStatus);

// Remove or comment out JWT-protected routes
// router.get('/me', protectSession, getCurrentUser);
router.get('/profile', protectSession, getUserProfile);
router.put('/profile', protectSession, updateUserProfile);

module.exports = router; 