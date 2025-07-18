const API_BASE_URL = "http://localhost:5000/api";

// Session-based authentication check
async function checkSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, { 
      credentials: 'include' 
    });
    const data = await response.json();
    if (!data.loggedIn) {
      alert('You must be logged in.');
      window.location.href = '/views/login.html';
      return false;
    }
    return data.user;
  } catch (error) {
    alert('Authentication error.');
    window.location.href = '/views/login.html';
    return false;
  }
}

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
        window.location.href = '/views/login.html';
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
      }
    });
  }
}

// Fetch user profile from backend
async function fetchUserProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Not authorized or error fetching profile');
    return await res.json();
  } catch (err) {
    alert(err.message);
    return null;
  }
}

// Update user profile
async function updateUserProfile(name, email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Profile updated!');
    } else {
      alert(data.message || 'Update failed');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
}

// Initialize dashboard with real user data
async function initDashboard() {
  const user = await fetchUserProfile();
  if (!user) return;
  document.getElementById('userName').textContent = user.name;
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileEmail').value = user.email;
}

// Initialize page
async function initPage() {
  const user = await checkSession();
  if (!user) return;
  
  updateNavbar();
  setupLogout();
  await initDashboard();
}

initPage();

// Profile form
const profileForm = document.getElementById('profileForm');
profileForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const password = document.getElementById('profilePassword') ? document.getElementById('profilePassword').value.trim() : undefined;
  if (!name || !email) {
    alert('Please fill in all fields.');
    return;
  }
  updateUserProfile(name, email, password);
});

// --- User Orders in Dashboard ---
const dashboardOrdersPanel = document.getElementById('dashboardOrders');
const dashboardOrdersTableDiv = dashboardOrdersPanel.querySelector('.dashboard-table');

async function fetchUserOrders() {
  try {
    const res = await fetch('http://localhost:5000/api/orders/my', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch orders');
    return data.data;
  } catch (err) {
    dashboardOrdersTableDiv.innerHTML = '<div style="color:red;">Error loading orders.</div>';
    return [];
  }
}

function renderDashboardOrders(orders) {
  if (!orders.length) {
    dashboardOrdersTableDiv.innerHTML = '<div style="color:#888;text-align:center;">No orders found.</div>';
    return;
  }
  let html = `<table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:#f5f5f5;"><th>Date</th><th>Status</th><th>Total</th><th>Details</th><th>Cancel</th></tr></thead><tbody>`;
  orders.forEach(order => {
    html += `<tr>
      <td>${new Date(order.createdAt).toLocaleString()}</td>
      <td>${order.status}</td>
      <td>₹${order.totalPrice}</td>
      <td><button class="cta-btn" data-id="${order._id}">Details</button></td>`;
    if (order.status !== 'cancelled' && order.status !== 'delivered') {
      html += `<td><button class="cancel-btn" data-cancel-id="${order._id}">Cancel</button></td>`;
    } else {
      html += `<td>-</td>`;
    }
    html += `</tr>`;
  });
  html += '</tbody></table>';
  dashboardOrdersTableDiv.innerHTML = html;
  dashboardOrdersTableDiv.querySelectorAll('button[data-id]').forEach(btn => {
    btn.onclick = () => showDashboardOrderDetails(btn.getAttribute('data-id'));
  });
  dashboardOrdersTableDiv.querySelectorAll('button[data-cancel-id]').forEach(btn => {
    btn.onclick = async () => {
      const orderId = btn.getAttribute('data-cancel-id');
      if (!confirm('Are you sure you want to cancel this order?')) return;
      btn.disabled = true;
      btn.textContent = 'Cancelling...';
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          alert('Order cancelled successfully.');
          fetchUserOrders().then(renderDashboardOrders);
        } else {
          alert(data.message || 'Failed to cancel order.');
          btn.disabled = false;
          btn.textContent = 'Cancel';
        }
      } catch (err) {
        alert('Error cancelling order.');
        btn.disabled = false;
        btn.textContent = 'Cancel';
      }
    };
  });
}

async function showDashboardOrderDetails(orderId) {
  try {
    const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch order details');
    const order = data.data;
    // Fetch product names for each item if not populated
    let itemsHtml = '';
    for (const item of order.items) {
      let name = item.product && item.product.name ? item.product.name : (item.product && item.product._id ? item.product._id : 'Unknown');
      itemsHtml += `<li>${item.quantity} x ${name} @ ₹${item.price}</li>`;
    }
    const detailsHtml = `
      <div style="padding:1em;">
        <h3>Order Details</h3>
        <div><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</div>
        <div><b>Status:</b> ${order.status}</div>
        <div><b>Total:</b> ₹${order.totalPrice}</div>
        <div><b>Shipping:</b> ${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}${order.shippingAddress.phone ? ', ' + order.shippingAddress.phone : ''}</div>
        <div style="margin-top:1em;"><b>Items:</b></div>
        <ul style="margin:0 0 1em 1em;padding:0;">${itemsHtml}</ul>
        <button class="cta-btn" onclick="document.getElementById('dashboardOrdersModal').style.display='none'">Close</button>
      </div>
    `;
    let modal = document.getElementById('dashboardOrdersModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dashboardOrdersModal';
      modal.className = 'modal';
      modal.style.display = 'block';
      modal.innerHTML = `<div class="modal-content" style="max-width:500px;margin:auto;">${detailsHtml}</div>`;
      document.body.appendChild(modal);
    } else {
      modal.innerHTML = `<div class="modal-content" style="max-width:500px;margin:auto;">${detailsHtml}</div>`;
      modal.style.display = 'block';
    }
    window.onclick = function(event) {
      if (event.target === modal) modal.style.display = 'none';
    };
  } catch (err) {
    alert('Error loading order details.');
  }
}

// Tab switching logic (extend to include orders)
const dashboardTabs = document.querySelectorAll('.dashboard-tab');
const dashboardPanelsAll = {
  listings: document.getElementById('dashboardListings'),
  orders: document.getElementById('dashboardOrders'),
  profile: document.getElementById('dashboardProfile')
};
dashboardTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    dashboardTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.keys(dashboardPanelsAll).forEach(key => {
      dashboardPanelsAll[key].style.display = (tab.dataset.tab === key) ? 'block' : 'none';
    });
    if (tab.dataset.tab === 'orders') fetchUserOrders().then(renderDashboardOrders);
  });
});

// Render listings
function renderListings() {
  const table = panels.listings.querySelector('.dashboard-table');
  table.innerHTML = '<div style="text-align:center;padding:2em 0;"><div style="font-size:3em;">🗂️</div><div style="font-size:1.2em;font-weight:600;margin:0.5em 0 0.2em 0;">No listings yet!</div><div style="color:#888;">Your products for sale will show up here.</div></div>';
}

// Render orders
function renderOrders() {
  const table = panels.orders.querySelector('.dashboard-table');
  table.innerHTML = '<div style="text-align:center;padding:2em 0;"><div style="font-size:3em;">📦</div><div style="font-size:1.2em;font-weight:600;margin:0.5em 0 0.2em 0;">No orders yet!</div><div style="color:#888;">Your purchases will appear here.</div></div>';
}

renderListings();
renderOrders();