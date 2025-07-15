const API_BASE_URL = 'http://localhost:5000/api';

// Navbar/auth logic
async function isAuthenticated() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' });
    const data = await res.json();
    return data && data.loggedIn;
  } catch {
    return false;
  }
}

async function updateNavbar() {
  const loggedIn = await isAuthenticated();
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const logoutLink = document.getElementById('logoutLink');
  if (loggedIn) {
    if (loginLink) loginLink.style.display = 'none';
    if (signupLink) signupLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline';
  } else {
    if (loginLink) loginLink.style.display = 'inline';
    if (signupLink) signupLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
  }
}

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
      } catch {
        alert('Logout failed. Please try again.');
      }
    });
  }
}

async function apiCall(endpoint, options = {}) {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...defaultOptions, ...options });
  return response.json();
}

// Render cart summary
async function renderCheckoutSummary() {
  const summaryDiv = document.getElementById('checkoutSummary');
  try {
    const cartRes = await apiCall('/cart');
    if (!cartRes.success || !cartRes.data.items.length) {
      summaryDiv.innerHTML = '<div style="color:red;">Your cart is empty. <a href="/views/cart.html">Go to cart</a></div>';
      document.getElementById('checkoutForm').style.display = 'none';
      return;
    }
    // Filter out invalid items
    const validItems = cartRes.data.items.filter(item => item.product && item.product._id);
    if (!validItems.length) {
      summaryDiv.innerHTML = '<div style="color:red;">Your cart contains invalid items. <a href="/views/cart.html">Go to cart</a></div>';
      document.getElementById('checkoutForm').style.display = 'none';
      return;
    }
    let total = 0;
    summaryDiv.innerHTML = '<h3>Order Summary</h3>' +
      '<ul style="margin:0 0 1em 1em;padding:0;">' +
      validItems.map(item => {
        const subtotal = item.product.price * item.quantity;
        total += subtotal;
        return `<li>${item.quantity} x ${item.product.name} @ ₹${item.product.price} = ₹${subtotal}</li>`;
      }).join('') +
      '</ul>' +
      `<div style="font-weight:bold;">Total: ₹${total}</div>`;
  } catch (err) {
    summaryDiv.innerHTML = '<div style="color:red;">Error loading cart summary.</div>';
  }
}

// Remove address form if present (handled in shipping.html)
const addressFields = [
  'shipFullName', 'shipAddress', 'shipCity', 'shipPostalCode', 'shipCountry', 'shipPhone'
];
addressFields.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.parentElement.style.display = 'none';
});

// Use address from localStorage
function getShippingAddress() {
  const saved = localStorage.getItem('shippingAddress');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

// Handle checkout form
const checkoutForm = document.getElementById('checkoutForm');
checkoutForm.onsubmit = async function(e) {
  e.preventDefault();
  alert('Submitting order...'); // DEBUG
  const placeOrderBtn = checkoutForm.querySelector('button[type="submit"]');
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Placing Order...';
  try {
    const cartRes = await apiCall('/cart');
    console.log('Cart response:', cartRes); // DEBUG
    if (!cartRes.success || !cartRes.data.items.length) throw new Error('Cart is empty.');
    const validItems = cartRes.data.items.filter(item => item.product && item.product._id);
    if (!validItems.length) throw new Error('Your cart contains invalid items. Please remove them and try again.');
    const items = validItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));
    const shippingAddress = getShippingAddress();
    console.log('Shipping address:', shippingAddress); // DEBUG
    if (!shippingAddress) {
      alert('Please enter your shipping address.');
      window.location.href = '/views/shipping.html';
      return;
    }
    console.log('Placing order with:', { items, shippingAddress }); // DEBUG
    const orderRes = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, shippingAddress })
    });
    console.log('Order response:', orderRes); // DEBUG
    if (!orderRes.success) {
      showOrderModal(orderRes.message || 'Order failed.');
      return;
    }
    showOrderModal('Order placed successfully!');
    // window.location.href = '/views/orders.html';
  } catch (err) {
    // alert('Order error: ' + (err.message || 'Error placing order.')); // DEBUG
    showOrderModal(err.message || 'Error placing order.');
  } finally {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
};

// Modal popup logic
function showOrderModal(message) {
  const modal = document.getElementById('orderModal');
  const msg = document.getElementById('orderModalMessage');
  if (msg) msg.textContent = message;
  if (modal) modal.style.display = 'block';
}

const closeModalBtn = document.getElementById('closeModal');
if (closeModalBtn) {
  closeModalBtn.onclick = function() {
    document.getElementById('orderModal').style.display = 'none';
    window.location.href = '/views/dashboard.html';
  };
}
window.onclick = function(event) {
  const modal = document.getElementById('orderModal');
  if (event.target === modal) {
    modal.style.display = 'none';
    window.location.href = '/views/dashboard.html';
  }
};

// On page load
(async function() {
  await updateNavbar();
  setupLogout();
  const loggedIn = await isAuthenticated();
  if (!loggedIn) {
    window.location.href = '/views/login.html';
    return;
  }
  renderCheckoutSummary();
})(); 