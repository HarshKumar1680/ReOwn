const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  buyNow
} = require('../controllers/cartController');

// All cart routes are protected (require authentication)
router.use(protect);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

router.post('/add', protect, addToCart);
router.post('/buy', protect, buyNow);

module.exports = router; 