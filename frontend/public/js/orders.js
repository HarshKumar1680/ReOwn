const API_BASE_URL = 'http://localhost:5000/api';

// Helpers
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showError(msg) {
  alert(msg);
}

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
        showError('Logout failed. Please try again.');
      }
    });
  }
}

// Fetch and render orders
async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/my`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch orders');
    return data.data;
  } catch (err) {
    showError('Error loading orders.');
    return [];
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersTableBody');
  const emptyDiv = document.getElementById('ordersEmpty');
  tbody.innerHTML = '';
  if (!orders.length) {
    emptyDiv.style.display = 'block';
    return;
  }
  emptyDiv.style.display = 'none';
  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:12px;">${formatDate(order.createdAt)}</td>
      <td>${order.status}</td>
      <td>₹${order.totalPrice}</td>
      <td><button class="cta-btn" data-id="${order._id}">Details</button></td>
    `;
    tbody.appendChild(tr);
  });
  // Add click listeners for details
  tbody.querySelectorAll('button[data-id]').forEach(btn => {
    btn.onclick = () => showOrderDetails(btn.getAttribute('data-id'));
  });
}

async function showOrderDetails(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch order details');
    const order = data.data;
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    content.innerHTML = `
      <h3>Order Details</h3>
      <div><b>Date:</b> ${formatDate(order.createdAt)}</div>
      <div><b>Status:</b> ${order.status}</div>
      <div><b>Total:</b> ₹${order.totalPrice}</div>
      <div><b>Shipping:</b> ${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}${order.shippingAddress.phone ? ', ' + order.shippingAddress.phone : ''}</div>
      <div style="margin-top:1em;"><b>Items:</b></div>
      <ul style="margin:0 0 1em 1em;padding:0;">
        ${order.items.map(item => `<li>${item.quantity} x ${item.product} @ ₹${item.price}</li>`).join('')}
      </ul>
    `;
    modal.style.display = 'block';
  } catch (err) {
    showError('Error loading order details.');
  }
}

document.getElementById('closeOrderDetails').onclick = function() {
  document.getElementById('orderDetailsModal').style.display = 'none';
};
window.onclick = function(event) {
  const modal = document.getElementById('orderDetailsModal');
  if (event.target === modal) modal.style.display = 'none';
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
  const orders = await fetchOrders();
  renderOrders(orders);
})(); 