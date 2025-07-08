const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema]
}, { timestamps: true });

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total price
cartSchema.methods.getTotal = function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Add item to cart
cartSchema.methods.addItem = function(productId, quantity, price) {
  const existingItem = this.items.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity: quantity,
      price: price
    });
  }
  
  return this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

// Update item quantity
cartSchema.methods.updateQuantity = function(productId, quantity) {
  const item = this.items.find(item => item.product.toString() === productId.toString());
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

// Clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema); 