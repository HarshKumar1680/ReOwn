// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

// Redirect to login if not authenticated
function redirectToLogin() {
  alert('Please login to view your cart');
  window.location.href = '/views/login.html';
}

// API helper functions using axios
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    method: 'GET',
    data: undefined,
    params: undefined
  };
  const config = { ...defaultOptions, ...options };
  try {
    const response = await axios({
      url: `${API_BASE_URL}${endpoint}`,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      redirectToLogin();
      return null;
    }
    console.error('API call failed:', error);
    throw error;
  }
}

// Get cart from backend
async function getCart() {
  try {
    const response = await apiCall('/cart');
    return response;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { success: false, data: { items: [] }, total: 0 };
  }
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
  try {
    const response = await apiCall('/cart', {
      method: 'POST',
      data: { productId, quantity }
    });
    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Update cart item quantity
async function updateCartItem(productId, quantity) {
  try {
    const response = await apiCall(`/cart/${productId}`, {
      method: 'PUT',
      data: { quantity }
    });
    return response;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

// Remove item from cart
async function removeFromCart(productId) {
  try {
    const response = await apiCall(`/cart/${productId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Clear cart
async function clearCart() {
  try {
    const response = await apiCall('/cart', {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// DOM elements
const cartItemsDiv = document.getElementById('cartItems');
const cartTotalDiv = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Render cart items
function renderCart(cartData) {
  cartItemsDiv.innerHTML = '';
  
  // Filter out items with null product
  const validItems = (cartData.items || []).filter(item => item.product);

  if (!cartData || validItems.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="/views/index.html" class="cta-btn">Continue Shopping</a>
      </div>
    `;
    cartTotalDiv.textContent = '\u20b90';
    return;
  }

  let total = 0;
  validItems.forEach((item, index) => {
    const product = item.product;
    const price = product.price || 0;
    let imagePath = product.image ? product.image : '';
    if (imagePath.startsWith('/')) imagePath = '..' + imagePath;
    else if (!imagePath.startsWith('..')) imagePath = '../public/images/' + imagePath;
    total += price * item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${imagePath}" alt="${product.name}" class="cart-item-img" style="width: 160px; height: 200px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
      <div class="cart-item-info">
        <h3>${product.name}</h3>
        <div class="price">\u20b9${price}</div>
        <div class="product-details">
          <span class="size">Size: ${product.size || 'N/A'}</span>
          <span class="condition">Condition: ${product.condition || 'N/A'}</span>
          <span class="brand">Brand: ${product.brand || 'N/A'}</span>
        </div>
        <div class="quantity-controls">
          <label>Qty: 
            <input type="number" min="1" max="${product.stock}" value="${item.quantity}" 
                   data-product-id="${product._id}" class="qty-input" style="width: 60px; padding: 4px 8px; font-size: 1rem; border-radius: 4px; border: 1px solid #ccc;">
          </label>
        </div>
        <button class="remove-btn" data-product-id="${product._id}">Remove</button>
      </div>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });
  
  updateTotal(cartData.total !== undefined ? cartData.total : total);
  addCartListeners();
}

// Update total
function updateTotal(total) {
  cartTotalDiv.textContent = `\u20b9${total}`;
}

// Add event listeners to cart items
function addCartListeners() {
  // Quantity change listeners
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const productId = e.target.dataset.productId;
      let quantity = parseInt(e.target.value);
      
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        e.target.value = 1;
      }
      
      try {
        const response = await updateCartItem(productId, quantity);
        if (response.success) {
          renderCart(response.data);
        }
      } catch (error) {
        alert('Error updating quantity. Please try again.');
        loadCart(); // Reload cart to reset
      }
    });
  });

  // Remove button listeners
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = e.target.dataset.productId;
      
      if (confirm('Are you sure you want to remove this item from your cart?')) {
        try {
          const response = await removeFromCart(productId);
          if (response.success) {
            renderCart(response.data);
          }
        } catch (error) {
          alert('Error removing item. Please try again.');
        }
      }
    });
  });
}

// Load cart data
async function loadCart() {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  try {
    const response = await getCart();
    if (response.success) {
      renderCart(response.data);
    } else {
      console.error('Failed to load cart:', response.message);
      renderCart({ items: [] });
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    renderCart({ items: [] });
  }
}

// Checkout functionality
checkoutBtn.addEventListener('click', () => {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }
  
  // For now, just show a placeholder message
  alert('Checkout functionality will be implemented in the next phase. This would typically redirect to a payment gateway.');
});

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

// Add some CSS for better styling
const style = document.createElement('style');
style.textContent = `
  .empty-cart {
    text-align: center;
    padding: 2rem;
  }
  
  .empty-cart p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
  }
  
  .cart-item {
    display: flex;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .cart-item-img {
    width: 160px;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 1rem;
  }
  
  .cart-item-info {
    flex: 1;
  }
  
  .cart-item-info h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }
  
  .price {
    font-size: 1.1rem;
    font-weight: bold;
    color: #047e84;
    margin-bottom: 0.5rem;
  }
  
  .product-details {
    margin-bottom: 0.5rem;
  }
  
  .product-details span {
    margin-right: 1rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .quantity-controls {
    margin-bottom: 0.5rem;
  }
  
  .qty-input {
    width: 60px;
    padding: 0.25rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .remove-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .remove-btn:hover {
    background: #c82333;
  }
  
  .cart-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  .total-label {
    font-size: 1.2rem;
    font-weight: bold;
  }
  
  .total-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #047e84;
  }
`;
document.head.appendChild(style); 