const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user & set session
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    if (req.session.user) {
      return res.status(400).json({ message: 'Already logged in. Please logout first.' });
    }
    const { email, password } = req.body;
    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user (destroy session)
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
};

// @desc    Get session status
// @route   GET /api/auth/session
// @access  Public
const sessionStatus = (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private (session)
const getUserProfile = async (req, res) => {
  try {
    const userId = req.session.user && req.session.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private (session)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.session.user && req.session.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, email, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save();
    // Update session user info
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  sessionStatus,
  getUserProfile,
  updateUserProfile
}; 