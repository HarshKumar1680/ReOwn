// Utility to get cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Utility to save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Get product info from the page
function getCurrentProduct() {
  return {
    id: getProductId(),
    name: document.getElementById('productName').textContent,
    price: parseInt(document.getElementById('productPrice').textContent.replace(/[^0-9]/g, '')),
    image: document.getElementById('productImg').src,
    quantity: 1
  };
}

// Get product id from URL
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

// Add to Cart handler
function handleAddToCart() {
  const product = getCurrentProduct();
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(product);
  }
  saveCart(cart);
  alert('Added to cart!');
}

// Buy Now handler
function handleBuyNow() {
  handleAddToCart();
  window.location.href = 'cart.html';
}

// Attach event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const addCartBtn = document.getElementById('addCartBtn');
  const buyBtn = document.getElementById('buyBtn');
  if (addCartBtn) addCartBtn.addEventListener('click', handleAddToCart);
  if (buyBtn) buyBtn.addEventListener('click', handleBuyNow);
}); 