const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please provide original price'],
    min: [0, 'Original price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['clothing', 'shoes', 'accessories', 'formal', 'casual', 'bridal']
  },
  size: {
    type: String,
    required: [true, 'Please provide a size']
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'good'
  },
  brand: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    default: 1,
    min: [0, 'Stock cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema); 