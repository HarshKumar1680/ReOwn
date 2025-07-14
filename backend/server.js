const dotenv = require('dotenv');
dotenv.config(); // Load env vars FIRST

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const PORT = process.env.PORT || 5000;
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

// Connect to database
connectDB();

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'admin@reown.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'harsh',
        email: 'harsh@reown.com',
        password: 'harsh123',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

createAdminUser();

const app = express();

// CORS: allow frontend to send credentials (cookies)
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session: allow cross-origin cookies for local dev
app.use(session({
  secret: 'reown-session-secret', // use env var in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if using HTTPS
    sameSite: 'lax' // 'lax' for local dev, 'none' for HTTPS
    // domain: 'localhost' // REMOVED for local dev compatibility
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ReOwn Backend API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error middleware:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 