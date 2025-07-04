let cart = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    price: 1299,
    image: '../public/images/denim-jacket.jpg',
    quantity: 1
  },
  {
    id: 2,
    name: 'Floral Summer Dress',
    price: 899,
    image: '../public/images/summer-dress.jpg',
    quantity: 2
  }
];

const cartItemsDiv = document.getElementById('cartItems');
const cartTotalDiv = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

function renderCart() {
  cartItemsDiv.innerHTML = '';
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalDiv.textContent = '₹0';
    return;
  }
  cart.forEach((item, idx) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="price">₹${item.price}</div>
        <label>Qty: <input type="number" min="1" value="${item.quantity}" data-idx="${idx}" class="qty-input"></label>
        <button class="remove-btn" data-idx="${idx}">Remove</button>
      </div>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });
  updateTotal();
  addCartListeners();
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalDiv.textContent = `₹${total}`;
}

function addCartListeners() {
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = e.target.dataset.idx;
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      cart[idx].quantity = val;
      renderCart();
    });
  });
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.idx;
      cart.splice(idx, 1);
      renderCart();
    });
  });
}

checkoutBtn.addEventListener('click', () => {
  alert('Checkout is not implemented yet.');
});

document.addEventListener('DOMContentLoaded', renderCart); 