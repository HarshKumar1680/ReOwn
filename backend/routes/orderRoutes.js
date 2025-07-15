const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

// User places an order
router.post('/', protect, authorize('user', 'admin'), createOrder);
// User gets their orders
router.get('/my', protect, authorize('user', 'admin'), getMyOrders);
// Admin gets all orders
router.get('/', protect, authorize('admin'), getAllOrders);
// Get order details (user or admin)
router.get('/:id', protect, authorize('user', 'admin'), getOrderById);
// Admin updates order status
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
// User cancels their order
router.put('/:id/cancel', protect, authorize('user', 'admin'), cancelOrder);

module.exports = router; 