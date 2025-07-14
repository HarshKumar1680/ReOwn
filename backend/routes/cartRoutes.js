const express = require('express');
const router = express.Router();
const { protectSession } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  buyNow
} = require('../controllers/cartController');

// All cart routes are protected (require session authentication)
router.use(protectSession);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

router.post('/add', addToCart);
router.post('/buy', buyNow);

module.exports = router; 