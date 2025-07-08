const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/category/:category', getProductsByCategory);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router; 