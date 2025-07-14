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

// --- Product Reviews Logic ---
const reviewsList = document.getElementById('reviewsList');
const reviewForm = document.getElementById('reviewForm');
const reviewRating = document.getElementById('reviewRating');
const reviewComment = document.getElementById('reviewComment');
let reviewsPage = 1;
const reviewsLimit = 5;
let reviewsCount = 0;
let productId = null;

function renderReviewsHeader(avgRating, count) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span style="color:${i <= Math.round(avgRating) ? '#FFD700' : '#ccc'};font-size:1.3em;">★</span>`;
  }
  return `<div style="margin-bottom:1rem;"><b>Average Rating:</b> ${avgRating.toFixed(1)} / 5 (${count} review${count !== 1 ? 's' : ''})<br>${stars}</div>`;
}

function renderReviewItem(r) {
  return `<div style="border-bottom:1px solid #eee;padding:0.7em 0;">
    <div>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} <b>${r.user?.name || 'User'}</b> <span style="color:#888;font-size:0.9em;">${new Date(r.createdAt).toLocaleDateString()}</span></div>
    <div>${r.comment}</div>
  </div>`;
}

async function fetchAndRenderReviews(reset = false) {
  if (!productId) return;
  if (reset) {
    reviewsPage = 1;
    if (reviewsList) reviewsList.innerHTML = '';
  }
  try {
    const res = await axios.get(`${API_BASE_URL}/products/${productId}/reviews?page=${reviewsPage}&limit=${reviewsLimit}`);
    if (res.data && res.data.success) {
      reviewsCount = res.data.count;
      if (reviewsList) {
        if (reviewsPage === 1) {
          reviewsList.innerHTML = renderReviewsHeader(res.data.avgRating, res.data.count);
        }
        res.data.data.forEach(r => {
          reviewsList.innerHTML += renderReviewItem(r);
        });
        // Add Load More button if more reviews exist
        let loadMoreBtn = document.getElementById('loadMoreReviewsBtn');
        if (reviewsPage * reviewsLimit < reviewsCount) {
          if (!loadMoreBtn) {
            loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'loadMoreReviewsBtn';
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.style.marginTop = '1em';
            loadMoreBtn.onclick = () => {
              reviewsPage++;
              fetchAndRenderReviews();
            };
            reviewsList.appendChild(loadMoreBtn);
          }
        } else if (loadMoreBtn) {
          loadMoreBtn.remove();
        }
      }
    }
  } catch (err) {
    if (reviewsList) reviewsList.innerHTML = '<div style="color:red;">Error loading reviews.</div>';
  }
}

if (reviewForm) {
  reviewForm.onsubmit = async function(e) {
    e.preventDefault();
    const rating = parseInt(reviewRating.value);
    const comment = reviewComment.value.trim();
    if (!rating || !comment) {
      alert('Please provide a rating and comment.');
      return;
    }
    // Check login
    const loggedIn = await isAuthenticated();
    if (!loggedIn) {
      alert('Please login to submit a review.');
      window.location.href = '/views/login.html';
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/products/${productId}/reviews`, { rating, comment }, { withCredentials: true });
      if (res.data && res.data.success) {
        alert('Review submitted!');
        reviewForm.reset();
        fetchAndRenderReviews(true);
      } else {
        alert(res.data.message || 'Error submitting review.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review.');
    }
  };
}

// On page load (extend existing IIFE)
(async function() {
  await updateNavbar();
  setupLogout();
  productId = getQueryParam('id');
  if (!productId) {
    showError('No product ID provided');
    return;
  }
  const product = await fetchProductById(productId);
  renderProductDetails(product);
  // Fetch and render reviews
  fetchAndRenderReviews(true);
})(); 