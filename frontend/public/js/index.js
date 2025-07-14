// Frontend served from http://localhost:5500
// Backend API at http://localhost:5000/api
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

// API helper functions
async function apiCall(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// --- Robust Homepage Product Fetching and Rendering ---
// (This code can be placed at the end of your file or where homepage logic is handled)

const API_BASE_URL_HOMEPAGE = 'http://localhost:5000/api'; // Adjust if needed

// Master array for homepage layout (fixed order)
const homepageCards = [
  { name: 'Maxi Skirt', image: '/public/images/maxi-skirt.jpg', section: 'product' },
  { name: "Men's Fashion", image: '/public/images/mens-fashion.jpeg', section: 'product' },
  { name: 'Silt Dress', image: '/public/images/silt-dress.jpg', section: 'product' },
  { name: "Men's Formal", image: '/public/images/mens-formal.jpg', section: 'product' },
  { name: "Women's Formal", image: '/public/images/womens-formal.jpg', section: 'product' },
  { name: 'Bridal Attire', image: '/public/images/bridal-attire.jpeg', section: 'product' },
  { name: 'Coat', image: '/public/images/coat.jpg', section: 'product' },
  { name: 'Heels', image: '/public/images/heels.jpg', section: 'product' },
  { name: 'Leather Blazers', image: '/public/images/leather-blazer.jpg', section: 'category' },
  { name: 'Dark Denim', image: '/public/images/dark-denim.jpg', section: 'category' },
  { name: 'Cozy Knits', image: '/public/images/cozy-knit.jpeg', section: 'category' },
  { name: 'Black Boots', image: '/public/images/black-boots.jpg', section: 'category' },
  { name: 'Trendy Bag', image: '/public/images/bag.jpg', section: 'extra' },
  { name: 'Sneakers', image: '/public/images/sneakers.jpg', section: 'extra' },
  { name: 'Scarf', image: '/public/images/scarf.jpg', section: 'extra' },
  { name: 'Hat', image: '/public/images/hat.jpg', section: 'extra' },
  { name: 'Watch', image: '/public/images/watch.jpg', section: 'extra' },
  { name: 'Belt', image: '/public/images/belt.jpg', section: 'extra' },
  { name: 'Earrings', image: '/public/images/earrings.jpg', section: 'extra' },
  { name: 'Sunglasses', image: '/public/images/sunglasses.jpg', section: 'extra' }
];

// Fetch products from backend
async function getProducts() {
  try {
    // Increase limit to 100 to ensure all products are fetched
    const response = await axios.get(`${API_BASE_URL}/products?limit=100`);
    return response.data; // { success, data }
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, data: [] };
  }
}

// Match backend products to homepage cards by name
function matchBackendProducts(cards, backendProducts) {
  const productMap = {};
  backendProducts.forEach(p => {
    productMap[p.name.trim().toLowerCase()] = p;
  });
  return cards.map(card => {
    const match = productMap[card.name.trim().toLowerCase()];
    if (match) {
      return { ...card, _id: match._id, isDemo: false };
    } else {
      return { ...card, _id: '', isDemo: true };
    }
  });
}

// Render cards for a section
function renderFixedCards(cards, section, containerId, cardClass) {
  const container = document.getElementById(containerId);
  if (!container) {
    // Only log error, do not break other JS
    console.error(`Container with id '${containerId}' not found in HTML.`);
    return;
  }
  container.innerHTML = '';
  cards.filter(card => card.section === section).forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = cardClass;
    if (card._id) cardDiv.setAttribute('data-id', card._id);
    cardDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}">
      <div>${card.name}</div>
      <button class="shop-btn" ${card.isDemo ? 'disabled' : ''}>Shop Now</button>
    `;
    // Add click handler for Shop Now
    const shopBtn = cardDiv.querySelector('.shop-btn');
    if (!card.isDemo && card._id) {
      shopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = `/product.html?id=${card._id}`;
      });
    } else {
      // Instead of alert, just disable the button and optionally log to console
      shopBtn.disabled = true;
      // console.warn(`No backend product found for card: ${card.name}`);
    }
    container.appendChild(cardDiv);
  });
}

// Update all product cards
function updateProductCards(products) {
  const cards = matchBackendProducts(homepageCards, products);
  // Debug: log cards that are not mapped (removed)
  // cards.forEach(card => {
  //   if (card.isDemo) {
  //     console.warn(`No backend product found for card: ${card.name}`);
  //   }
  // });
  renderFixedCards(cards, 'product', 'productCardsContainer', 'product-card');
  renderFixedCards(cards, 'category', 'categoryCardsContainer', 'category-card');
  renderFixedCards(cards, 'extra', 'extraProductCardsContainer', 'extra-product-card');
}

// Load products and update the page
async function loadProducts() {
  // Only run if homepage containers exist (prevents running on other pages)
  if (!document.getElementById('productCardsContainer')) return;
  console.log('Loading products from API...');
  const response = await getProducts();
  console.log('API response:', response);
  if (response.success && response.data.length > 0) {
    console.log(`Found ${response.data.length} products`);
    updateProductCards(response.data);
  } else {
    console.log('No products found or error loading products');
  }
}

// Initialize homepage product loading if on homepage
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}
// --- End homepage product logic ---

// Fallback: Attach a warning handler to all .shop-btn buttons if not already handled
function addFallbackShopBtnHandlers() {
  document.querySelectorAll('.shop-btn').forEach(btn => {
    if (!btn.onclick && !btn._hasDynamicHandler) {
      btn.addEventListener('click', function() {
        // console.warn('No product mapped to this Shop Now button. Check product mapping and API order.');
        // alert('This product is not available. Please try another.');
        // Do nothing: button is disabled, no alert needed
      });
    }
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing product loading...');
  loadProducts().then(() => {
    addFallbackShopBtnHandlers();
    updateNavbar(); // Update navbar on load
    setupLogout(); // Setup logout functionality
  });
}); 