const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const PORT = process.env.PORT || 5000;

// Load env vars
dotenv.config();

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/contact', require('./routes/contact'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ReOwn Backend API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 