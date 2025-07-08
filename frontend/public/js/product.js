// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
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
    console.error('API call failed:', error);
    throw error;
  }
}

// Get product by ID
async function getProduct(productId) {
  try {
    const response = await apiCall(`/products/${productId}`);
    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/cart/add`, { productId, quantity }, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Buy now
async function buyNow(productId, quantity = 1) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/cart/buy`, { productId, quantity }, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error buying now:', error);
    throw error;
  }
}

// Get product ID from URL
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Render product details
function renderProduct(product) {
  document.getElementById('productImg').src = product.image;
  document.getElementById('productImg').alt = product.name;
  document.getElementById('productName').textContent = product.name;
  document.getElementById('productPrice').textContent = `₹${product.price}`;
  document.querySelector('.original-price').textContent = `₹${product.originalPrice}`;
  document.getElementById('productDesc').textContent = product.description;
  
  // Add product details
  const productDetails = document.createElement('div');
  productDetails.className = 'product-details';
  productDetails.innerHTML = `
    <div class="detail-item">
      <strong>Size:</strong> ${product.size}
    </div>
    <div class="detail-item">
      <strong>Condition:</strong> ${product.condition}
    </div>
    <div class="detail-item">
      <strong>Brand:</strong> ${product.brand || 'N/A'}
    </div>
    <div class="detail-item">
      <strong>Stock:</strong> ${product.stock} available
    </div>
  `;
  
  // Insert after description
  const descElement = document.getElementById('productDesc');
  descElement.parentNode.insertBefore(productDetails, descElement.nextSibling);
}

// Handle add to cart
async function handleAddToCart() {
  const productId = getProductId();
  if (!isAuthenticated()) {
    alert('Please login to add items to cart');
    window.location.href = '/views/login.html';
    return;
  }
  try {
    const response = await addToCart(productId, 1);
    if (response.success) {
      alert('Item added to cart successfully!');
      updateCartCount();
    } else {
      alert(response.message || 'Failed to add item to cart');
    }
  } catch (error) {
    alert('Error adding item to cart. Please try again.');
  }
}

// Handle buy now
async function handleBuyNow() {
  const productId = getProductId();
  if (!isAuthenticated()) {
    alert('Please login to purchase items');
    window.location.href = '/views/login.html';
    return;
  }
  try {
    const response = await buyNow(productId, 1);
    if (response.success) {
      alert('Buy now successful (cart updated)!');
      updateCartCount();
    } else {
      alert(response.message || 'Failed to buy now');
    }
  } catch (error) {
    alert('Error with buy now. Please try again.');
  }
}

// Load product data
async function loadProduct() {
  const productId = getProductId();
  
  if (!productId) {
    alert('No product ID provided');
    window.location.href = '/views/index.html';
    return;
  }
  
  try {
    const response = await getProduct(productId);
    if (response.success) {
      renderProduct(response.data);
    } else {
      alert('Product not found');
      window.location.href = '/views/index.html';
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Error loading product. Please try again.');
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
  
  // Add event listeners
  const addCartBtn = document.getElementById('addCartBtn');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', handleAddToCart);
  }
  const buyBtn = document.getElementById('buyBtn');
  if (buyBtn) {
    buyBtn.addEventListener('click', handleBuyNow);
  }
  updateCartCount();
});

// Update updateCartCount to not use localStorage for cart
async function updateCartCount() {
  const cartCountElem = document.getElementById('cartCount');
  if (!cartCountElem) return;
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/cart/count`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    const data = response.data;
    if (data.success) {
      cartCountElem.textContent = data.count;
    } else {
      cartCountElem.textContent = '0';
    }
  } catch (error) {
    cartCountElem.textContent = '0';
  }
}

// Add CSS for product details
const style = document.createElement('style');
style.textContent = `
  .product-details {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .detail-item {
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }
  
  .detail-item strong {
    color: #333;
    margin-right: 0.5rem;
  }
  
  .product-pricing {
    margin: 1rem 0;
  }
  
  .original-price {
    text-decoration: line-through;
    color: #999;
    margin-right: 1rem;
  }
  
  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #047e84;
  }
  
  .buy-btn, .add-cart-btn {
    margin: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
  }
  
  .buy-btn {
    background: #047e84;
    color: white;
  }
  
  .buy-btn:hover {
    background: #036a6f;
  }
  
  .add-cart-btn {
    background: #28a745;
    color: white;
  }
  
  .add-cart-btn:hover {
    background: #218838;
  }
`;
document.head.appendChild(style); 