const Order = require('../models/Order');
const QRCode = require('qrcode');

// UPI details
const UPI_ID = 'harshkumar1680@oksbi';
const PAYEE_NAME = 'Harsh Kumar'; // Change if you want a different display name

// Generate UPI payment URL
function generateUpiUrl({ upiId, payeeName, amount, orderId }) {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=Order%20${orderId}`;
}

// Controller to get payment QR code for an order
exports.getPaymentQRCode = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only allow payment if order is not already paid/cancelled
    if (order.status === 'cancelled' || order.status === 'paid') {
      return res.status(400).json({ message: 'Order cannot be paid' });
    }
    const upiUrl = generateUpiUrl({
      upiId: UPI_ID,
      payeeName: PAYEE_NAME,
      amount: order.totalPrice,
      orderId: order._id
    });
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl);
    res.json({
      qrCode: qrCodeDataUrl,
      upiUrl,
      upiId: UPI_ID,
      payeeName: PAYEE_NAME,
      amount: order.totalPrice,
      orderId: order._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate payment QR code' });
  }
};

// Accept payment proof (transaction ID) from user
exports.submitPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { txnId } = req.body;
    if (!txnId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only the order owner can submit proof, and only if payment is pending
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Payment proof already submitted or not allowed' });
    }
    order.paymentStatus = 'awaiting_verification';
    order.paymentProof = { txnId, submittedAt: new Date() };
    await order.save();
    res.json({ message: 'Payment proof submitted. Awaiting verification.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit payment proof' });
  }
}; 