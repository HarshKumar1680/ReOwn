const products = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    price: 1299,
    image: '../public/images/denim-jacket.jpg',
    category: 'men',
    description: 'Classic blue denim, lightly worn.'
  },
  {
    id: 2,
    name: 'Floral Summer Dress',
    price: 899,
    image: '../public/images/summer-dress.jpg',
    category: 'women',
    description: 'Lightweight, perfect for summer.'
  },
  {
    id: 3,
    name: 'Kids Graphic Tee',
    price: 299,
    image: '../public/images/kids-tee.jpg',
    category: 'kids',
    description: 'Fun print, soft cotton.'
  },
  {
    id: 4,
    name: 'Leather Handbag',
    price: 1599,
    image: '../public/images/handbag.jpg',
    category: 'accessories',
    description: 'Genuine leather, gently used.'
  }
];

const featuredProducts = document.getElementById('featuredProducts');
const searchBar = document.getElementById('searchBar');
const categoryFilter = document.getElementById('categoryFilter');

function renderProducts(list) {
  featuredProducts.innerHTML = '';
  if (list.length === 0) {
    featuredProducts.innerHTML = '<p>No products found.</p>';
    return;
  }
  list.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price">₹${product.price}</div>
    `;
    featuredProducts.appendChild(card);
  });
}

function filterProducts() {
  const search = searchBar.value.toLowerCase();
  const category = categoryFilter.value;
  let filtered = products.filter(p =>
    (p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)) &&
    (category === '' || p.category === category)
  );
  renderProducts(filtered);
}

searchBar.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);

document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
});


(function() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  let current = 0;
  let interval = null;

  function showSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === idx);
      dots[i].classList.toggle('active', i === idx);
    });
    current = idx;
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }

  function startAutoSlide() {
    if (interval) clearInterval(interval);
    interval = setInterval(nextSlide, 3000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startAutoSlide();
    });
  });

  showSlide(0);
  startAutoSlide();
})();


(function() {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-slider-dot');
  let current = 0;
  let interval = null;

  function showSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === idx);
      dots[i].classList.toggle('active', i === idx);
    });
    current = idx;
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }

  function startAutoSlide() {
    if (interval) clearInterval(interval);
    interval = setInterval(nextSlide, 3000);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startAutoSlide();
    });
  });

  showSlide(0);
  startAutoSlide();
})(); 