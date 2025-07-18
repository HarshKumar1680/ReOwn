const API_BASE_URL = 'http://localhost:5000/api';

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include' // <-- Always include credentials
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });
  return response.json();
}

async function loadProduct() {
  const productId = getProductId();
  if (!productId) {
    alert('No product ID provided');
    window.location.href = '/views/index.html';
    return;
  }
  try {
    const response = await apiCall(`/products/${productId}`);
    if (response.success) {
      renderProduct(response.data);
    } else {
      alert('Product not found');
      window.location.href = '/views/index.html';
    }
  } catch (error) {
    alert('Error loading product. Please try again.');
  }
}

function renderProduct(product) {
  document.getElementById('productImg').src = product.image;
  document.getElementById('productImg').alt = product.name;
  document.getElementById('productName').textContent = product.name;
  document.getElementById('productPrice').textContent = `₹${product.price}`;
  document.getElementById('productDesc').textContent = product.description;
  // Fill meta list fields
  document.getElementById('productCategory').textContent = product.category || 'N/A';
  document.getElementById('productBrand').textContent = product.brand || 'N/A';
  document.getElementById('productSize').textContent = product.size || 'N/A';
  document.getElementById('productCondition').textContent = product.condition || 'N/A';
  document.getElementById('productStock').textContent = product.stock != null ? product.stock : 'N/A';
}

async function handleAddToCart() {
  if (!isAuthenticated()) {
    alert('Please login to add items to cart');
    window.location.href = '/views/login.html';
    return;
  }
  const productId = getProductId();
  try {
    const response = await apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    });
    console.log('Add to Cart API response:', response);
    if (response.success) {
      window.location.href = '/views/cart.html';
    } else {
      alert(response.message || 'Failed to add item to cart');
    }
  } catch (error) {
    alert('Error adding item to cart. Please try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
  document.getElementById('addToCartBtn').addEventListener('click', handleAddToCart);
}); 