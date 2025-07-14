const API_BASE_URL = 'http://localhost:5000/api';

// Session-based navbar management
async function updateNavbar() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, { 
      credentials: 'include' 
    });
    const data = await response.json();
    
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (data.loggedIn) {
      // User is logged in - hide login/signup, show logout
      if (loginLink) loginLink.style.display = 'none';
      if (signupLink) signupLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'inline';
    } else {
      // User is not logged in - show login/signup, hide logout
      if (loginLink) loginLink.style.display = 'inline';
      if (signupLink) signupLink.style.display = 'inline';
      if (logoutLink) logoutLink.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking session:', error);
    // Fallback: show login/signup
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');
    if (loginLink) loginLink.style.display = 'inline';
    if (signupLink) signupLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
  }
}

// Add logout functionality
function setupLogout() {
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        window.location.reload();
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
      }
    });
  }
}

async function isAuthenticated() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, { 
      credentials: 'include' 
    });
    const data = await response.json();
    return data.loggedIn;
  } catch (error) {
    return false;
  }
}

async function apiCall(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });
  return response.json();
}

async function loadCart() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    alert('Please login to view your cart');
    window.location.href = '/views/login.html';
    return;
  }
  try {
    const response = await apiCall('/cart');
    if (response.success) {
      renderCart(response.data, response.total);
    } else {
      renderCart({ items: [] }, 0);
    }
  } catch (error) {
    renderCart({ items: [] }, 0);
  }
}

function renderCart(cart, total) {
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalDiv = document.getElementById('cartTotal');
  cartItemsDiv.innerHTML = '';

  // Filter out items with null product
  const validItems = (cart.items || []).filter(item => item.product);

  if (!validItems.length) {
    cartItemsDiv.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <button class="continue-shopping-btn" onclick="window.location.href='/views/index.html'">Continue Shopping</button>
      </div>
    `;
    cartTotalDiv.textContent = '';
    return;
  }

  let grandTotal = 0;
  validItems.forEach(item => {
    const product = item.product;
    const price = product.price || 0;
    const subtotal = price * item.quantity;
    grandTotal += subtotal;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-price">₹${price} x ${item.quantity} = ₹${subtotal}</div>
        <div class="cart-item-qty">
          <label>Qty: <input type="number" min="1" max="${product.stock}" value="${item.quantity}" data-product-id="${product._id}" class="qty-input"></label>
          <button class="cart-item-remove" data-product-id="${product._id}">Remove</button>
        </div>
      </div>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });
  cartTotalDiv.textContent = `Total: ₹${grandTotal}`;
  addCartListeners();
}

function addCartListeners() {
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const productId = e.target.dataset.productId;
      let quantity = parseInt(e.target.value);
      if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        e.target.value = 1;
      }
      try {
        await apiCall(`/cart/${productId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity })
        });
        loadCart();
      } catch (error) {
        alert('Error updating quantity. Please try again.');
        loadCart();
      }
    });
  });
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = e.target.dataset.productId;
      if (confirm('Are you sure you want to remove this item from your cart?')) {
        try {
          await apiCall(`/cart/${productId}`, { method: 'DELETE' });
          loadCart();
        } catch (error) {
          alert('Error removing item. Please try again.');
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar(); // Update navbar on load
  setupLogout(); // Setup logout functionality
  loadCart();
}); 