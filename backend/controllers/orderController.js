const Order = require('../models/Order');
const Product = require('../models/Product');

// Place a new order
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, shippingAddress, totalPrice, paymentProof, paymentStatus } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address required.' });
    }
    if (!paymentProof || !paymentProof.txnId) {
      return res.status(400).json({ success: false, message: 'Payment proof (transaction ID) required.' });
    }
    // Calculate total and check stock
    let calcTotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: 'Product not found or inactive.' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      calcTotal += product.price * item.quantity;
    }
    if (Number(totalPrice) !== calcTotal) {
      return res.status(400).json({ success: false, message: 'Total price mismatch.' });
    }
    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    // Create order with payment proof
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      totalPrice: calcTotal,
      paymentStatus: paymentStatus === 'awaiting_verification' ? 'awaiting_verification' : 'awaiting_verification',
      paymentProof: {
        txnId: paymentProof.txnId,
        submittedAt: new Date()
      }
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error placing order', error: error.message });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching all orders' });
  }
};

// Get order by ID (user or admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Only allow user to see their own order, or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order' });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
};

// Cancel order (user)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // Only allow user to cancel their own order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order already cancelled' });
    }
    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling order' });
  }
};

// Admin: verify payment (mark as paid or failed)
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'paid' or 'failed'
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus !== 'awaiting_verification') {
      return res.status(400).json({ success: false, message: 'Order is not awaiting payment verification' });
    }
    if (action === 'paid') {
      order.paymentStatus = 'paid';
    } else if (action === 'failed') {
      order.paymentStatus = 'failed';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying payment' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  verifyPayment
}; 