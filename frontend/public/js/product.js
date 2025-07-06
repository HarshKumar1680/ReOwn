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
          window.location.href = '/views/cart.html';
}

// Product and category data (add your real data as needed)
const products = [
  { id: '2', name: "Men's Fashion", image: '../public/images/mens-fashion.jpeg', desc: 'Trendy men\'s fashion.' },
  { id: '3', name: 'Silt Dress', image: '../public/images/silt-dress.jpg', desc: 'Elegant silt dress.' },
  { id: '4', name: "Men's Formal", image: '../public/images/mens-formal.jpg', desc: 'Formal wear for men.' },
  { id: '5', name: "Women's Formal", image: '../public/images/womens-formal.jpg', desc: 'Formal wear for women.' },
  { id: '6', name: 'Bridal Attire', image: '../public/images/bridal-attire.jpeg', desc: 'Beautiful bridal attire.' },
  { id: '7', name: 'Coat', image: '../public/images/coat.jpg', desc: 'Warm and stylish coat.' },
  { id: '8', name: 'Heels', image: '../public/images/heels.jpg', desc: 'Fashionable heels.' },
  // Category cards
  { id: '101', name: 'Leather Blazers', image: '../public/images/leather-blazer.jpg', desc: 'Premium leather blazers.' },
  { id: '102', name: 'Dark Denim', image: '../public/images/dark-denim.jpg', desc: 'Classic dark denim.' },
  { id: '103', name: 'Cozy Knits', image: '../public/images/cozy-knit.jpeg', desc: 'Soft and cozy knits.' },
  { id: '104', name: 'Black Boots', image: '../public/images/black-boots.jpg', desc: 'Stylish black boots.' },
];

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderProduct() {
  const id = getProductIdFromUrl();
  const product = products.find(p => p.id === id);
  const container = document.getElementById('productDetails');
  if (!product) {
    container.innerHTML = '<h2>Product Not Found</h2>';
    return;
  }
  container.innerHTML = `
    <div class="product-details">
      <div class="product-img-col">
        <img src="${product.image}" alt="${product.name}" class="product-img" />
      </div>
      <div class="product-info-col">
        <h1>${product.name}</h1>
        <div class="product-pricing">Price: <span class="price">₹1999</span></div>
        <p>${product.desc}</p>
        <button class="buy-btn">Add to Cart</button>
      </div>
    </div>
  `;
}

// Attach event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const addCartBtn = document.getElementById('addCartBtn');
  const buyBtn = document.getElementById('buyBtn');
  if (addCartBtn) addCartBtn.addEventListener('click', handleAddToCart);
  if (buyBtn) buyBtn.addEventListener('click', handleBuyNow);
  renderProduct();
}); 