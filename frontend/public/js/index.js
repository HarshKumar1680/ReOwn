// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Ensure axios is available (assume included via CDN or npm)
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

// Get all products
async function getProducts() {
  try {
    const response = await apiCall('/products?limit=20');
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, data: [] };
  }
}

// Add function to fetch cart from backend
async function getBackendCart() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.data && response.data.success && response.data.data && response.data.data.items) {
      return response.data.data.items.map(item => item.product._id);
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Demo fallback data for cards
const demoProducts = [
  { name: 'Maxi Skirt', image: '../public/images/maxi-skirt.jpg' },
  { name: "Men's Fashion", image: '../public/images/mens-fashion.jpeg' },
  { name: 'Silt Dress', image: '../public/images/silt-dress.jpg' },
  { name: "Men's Formal", image: '../public/images/mens-formal.jpg' },
  { name: "Women's Formal", image: '../public/images/womens-formal.jpg' },
  { name: 'Bridal Attire', image: '../public/images/bridal-attire.jpeg' },
  { name: 'Coat', image: '../public/images/coat.jpg' },
  { name: 'Heels', image: '../public/images/heels.jpg' },
  { name: 'Leather Blazers', image: '../public/images/leather-blazer.jpg' },
  { name: 'Dark Denim', image: '../public/images/dark-denim.jpg' },
  { name: 'Cozy Knits', image: '../public/images/cozy-knit.jpeg' },
  { name: 'Black Boots', image: '../public/images/black-boots.jpg' },
  { name: 'Bag', image: '../public/images/bag.jpg' },
  { name: 'Sneakers', image: '../public/images/sneakers.jpg' },
  { name: 'Scarf', image: '../public/images/scarf.jpg' },
  { name: 'Hat', image: '../public/images/hat.jpg' },
  { name: 'Watch', image: '../public/images/watch.jpg' },
  { name: 'Belt', image: '../public/images/belt.jpg' },
  { name: 'Earrings', image: '../public/images/earrings.jpg' },
  { name: 'Sunglasses', image: '../public/images/sunglasses.jpg' }
];

// Master array for homepage layout (fixed order)
const homepageCards = [
  // Product cards (8)
  { name: 'Maxi Skirt', image: '../public/images/maxi-skirt.jpg', section: 'product' },
  { name: "Men's Fashion", image: '../public/images/mens-fashion.jpeg', section: 'product' },
  { name: 'Silt Dress', image: '../public/images/silt-dress.jpg', section: 'product' },
  { name: "Men's Formal", image: '../public/images/mens-formal.jpg', section: 'product' },
  { name: "Women's Formal", image: '../public/images/womens-formal.jpg', section: 'product' },
  { name: 'Bridal Attire', image: '../public/images/bridal-attire.jpeg', section: 'product' },
  { name: 'Coat', image: '../public/images/coat.jpg', section: 'product' },
  { name: 'Heels', image: '../public/images/heels.jpg', section: 'product' },
  // Category cards (4)
  { name: 'Leather Blazers', image: '../public/images/leather-blazer.jpg', section: 'category' },
  { name: 'Dark Denim', image: '../public/images/dark-denim.jpg', section: 'category' },
  { name: 'Cozy Knits', image: '../public/images/cozy-knit.jpeg', section: 'category' },
  { name: 'Black Boots', image: '../public/images/black-boots.jpg', section: 'category' },
  // Extra products & accessories (8)
  { name: 'Trendy Bag', image: '../public/images/bag.jpg', section: 'extra' },
  { name: 'Sneakers', image: '../public/images/sneakers.jpg', section: 'extra' },
  { name: 'Scarf', image: '../public/images/scarf.jpg', section: 'extra' },
  { name: 'Hat', image: '../public/images/hat.jpg', section: 'extra' },
  { name: 'Watch', image: '../public/images/watch.jpg', section: 'extra' },
  { name: 'Belt', image: '../public/images/belt.jpg', section: 'extra' },
  { name: 'Earrings', image: '../public/images/earrings.jpg', section: 'extra' },
  { name: 'Sunglasses', image: '../public/images/sunglasses.jpg', section: 'extra' }
];

function matchBackendProducts(cards, backendProducts) {
  // Map backend products by name (case-insensitive)
  const productMap = {};
  backendProducts.forEach(p => {
    productMap[p.name.trim().toLowerCase()] = p;
  });
  // Attach _id if found
  return cards.map(card => {
    const match = productMap[card.name.trim().toLowerCase()];
    if (match) {
      return { ...card, _id: match._id, isDemo: false };
    } else {
      return { ...card, _id: '', isDemo: true };
    }
  });
}

// Add user feedback helpers
function showSuccess(message) {
  alert(message); // Replace with toast/banner in production
}
function showError(message) {
  alert(message); // Replace with toast/banner in production
}

// Update renderFixedCards to only show success if backend returns success
async function renderFixedCards(cards, section, containerId, cardClass) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  // Fetch cart from backend
  const cartProductIds = await getBackendCart();
  cards.filter(card => card.section === section).forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = cardClass;
    cardDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}">
      <div>${card.name}</div>
      <button class="shop-btn">Shop Now</button>
    `;
    const shopBtn = cardDiv.querySelector('.shop-btn');
    if (!card.isDemo && card._id) {
      // Check if already in cart (using backend cart)
      const inCart = cartProductIds.includes(card._id);
      if (inCart) {
        shopBtn.textContent = 'Added!';
        shopBtn.disabled = true;
      } else {
        shopBtn.onclick = async (e) => {
          e.stopPropagation();
          try {
            const response = await apiCall('/cart/add', {
              method: 'POST',
              data: { productId: card._id, quantity: 1 }
            });
            if (response && response.success) {
              shopBtn.textContent = 'Added!';
              shopBtn.disabled = true;
              showSuccess('Added to cart successfully!');
            } else {
              showError(response && response.message ? response.message : 'Failed to add to cart.');
            }
          } catch (err) {
            showError('Error adding to cart.');
          }
        };
      }
      cardDiv.onclick = () => {
        window.location.href = `product.html?id=${card._id}`;
      };
    } else {
      shopBtn.disabled = true;
    }
    container.appendChild(cardDiv);
  });
}

// Update product cards with real data
async function updateProductCards(backendProducts) {
  const cards = matchBackendProducts(homepageCards, backendProducts);
  await renderFixedCards(cards, 'product', 'productCardsContainer', 'product-card');
  await renderFixedCards(cards, 'category', 'categoryCardsContainer', 'category-card');
  await renderFixedCards(cards, 'extra', 'extraProductCardsContainer', 'extra-product-card');
}

// Load products and update the page
async function loadProducts() {
  try {
    console.log('Loading products from API...');
    const response = await getProducts();
    console.log('API response:', response);
    if (response.success && response.data.length > 0) {
      console.log(`Found ${response.data.length} products`);
      await updateProductCards(response.data);
    } else {
      console.log('No products found or error loading products');
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing product loading...');
  loadProducts();
}); 