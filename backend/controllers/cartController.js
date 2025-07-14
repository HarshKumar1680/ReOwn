const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price originalPrice image description stock size condition brand'
    });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    res.json({ 
      success: true, 
      data: cart,
      total: cart.getTotal()
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Error fetching cart' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity required.' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Debug logs
    console.log('➡️ userId:', userId);
    console.log('➡️ productId:', productId);
    console.log('➡️ quantity:', quantity);

    // Use model method
    await cart.addItem(productId, quantity);

    // Populate product details for the response
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice image description stock size condition brand'
    });

    // Debug log updated cart
    console.log('🛒 Updated Cart:', JSON.stringify(cart, null, 2));

    res.json({ success: true, message: 'Added to cart', cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }
    
    // Check product stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    
    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    // Update quantity
    await cart.updateQuantity(productId, quantity);
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice image description stock size condition brand'
    });
    
    res.json({ 
      success: true, 
      data: cart,
      total: cart.getTotal(),
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Error updating cart' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    // Remove item
    await cart.removeItem(productId);
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice image description stock size condition brand'
    });
    
    res.json({ 
      success: true, 
      data: cart,
      total: cart.getTotal(),
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Error removing from cart' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    await cart.clearCart();
    
    res.json({ 
      success: true, 
      data: cart,
      total: 0,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Error clearing cart' });
  }
};

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
const getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({ success: false, message: 'Error getting cart count' });
  }
};

// Buy Now (for now, same as add to cart)
const buyNow = async (req, res) => {
  // You can later implement order logic here
  return addToCart(req, res);
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  buyNow
}; 