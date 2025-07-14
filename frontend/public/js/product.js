// Frontend served from http://localhost:5500
// Backend API at http://localhost:5000/api
const API_BASE_URL = 'http://localhost:5000/api';

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

async function fetchProductById(productId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Ensure showMessage is only called with a real message
function showMessage(msg) {
  if (!msg) return; // Do not show empty alerts
  alert(msg);
}
function showError(msg) {
  const errDiv = document.getElementById('product-error');
  if (errDiv) errDiv.textContent = msg;
}
function clearMessages() {
  showMessage('');
  showError('');
}

async function isAuthenticated() {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/session`, { withCredentials: true });
    return response.data && response.data.loggedIn;
  } catch (error) {
    return false;
  }
}

async function handleAddToCart(productId) {
  clearMessages();
  const loggedIn = await isAuthenticated();
  if (!loggedIn) {
    showError('Please login to add items to cart. Redirecting...');
    setTimeout(() => window.location.href = '/views/login.html', 1500);
    return;
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/cart`, { productId, quantity: 1 }, { withCredentials: true });
    if (response.data && response.data.success) {
      showMessage('Item added to cart successfully!');
    } else {
      showError(response.data.message || 'Failed to add item to cart.');
    }
  } catch (error) {
    showError('Error adding item to cart.');
  }
}

async function handleBuyNow(productId) {
  clearMessages();
  const loggedIn = await isAuthenticated();
  if (!loggedIn) {
    showError('Please login to buy items. Redirecting...');
    setTimeout(() => window.location.href = '/views/login.html', 1500);
    return;
  }
  try {
    const response = await axios.post(`${API_BASE_URL}/cart`, { productId, quantity: 1 }, { withCredentials: true });
    if (response.data && response.data.success) {
      showMessage('Item added to cart! Redirecting to cart...');
      setTimeout(() => window.location.href = '/views/cart.html', 1500);
    } else {
      showError(response.data.message || 'Failed to buy item.');
    }
  } catch (error) {
    showError('Error buying item.');
  }
}

function renderProductDetails(product) {
  if (!product || !product.data) {
    showError('Product not found.');
    return;
  }
  const p = product.data;
  document.getElementById('productImg').src = p.image;
  document.getElementById('productImg').alt = p.name;
  document.getElementById('productName').textContent = p.name;
  document.getElementById('productOriginalPrice').textContent = `₹${p.originalPrice}`;
  document.getElementById('productPrice').textContent = `₹${p.price}`;
  document.getElementById('productDesc').textContent = p.description || '';
  document.getElementById('productShipping').textContent = 'Free shipping available.';
  document.getElementById('buyNowBtn').onclick = () => handleBuyNow(p._id);
  document.getElementById('addToCartBtn').onclick = () => handleAddToCart(p._id);
}

// Update navbar based on authentication status
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

// Setup logout functionality
function setupLogout() {
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
        window.location.reload();
      } catch (error) {
        showError('Logout failed. Please try again.');
      }
    });
  }
}

// On page load
(async function() {
  await updateNavbar();
  setupLogout();
  const productId = getQueryParam('id');
  if (!productId) {
    showError('No product ID provided');
    return;
  }
  const product = await fetchProductById(productId);
  renderProductDetails(product);
  // Placeholder: Review form logic can be added here
})(); 