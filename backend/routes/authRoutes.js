const express = require('express');
const passport = require('passport');
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

// Google OAuth: Initiate
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth: Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/views/login.html', session: true }),
  (req, res) => {
    // Force session save before redirect
    req.session.save(() => {
      setTimeout(() => {
        res.redirect('http://localhost:5500/views/dashboard.html');
      }, 500);
    });
  }
);

// Get current user session (for frontend)
router.get('/session', (req, res) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session check:', req.session, req.user);
  if (req.isAuthenticated() && req.user) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router; 