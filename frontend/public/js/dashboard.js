const API_BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem('token');

if (!token) {
  alert('You must be logged in.');
  window.location.href = '/views/login.html';
}

// Fetch user profile from backend
async function fetchUserProfile() {
  try {
    const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    return res.data;
  } catch (err) {
    alert(err.message);
    return null;
  }
}

// Update user profile
async function updateUserProfile(name, email, password) {
  try {
    const res = await axios.put(`${API_BASE_URL}/auth/profile`, { name, email, password }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    const data = res.data;
    alert('Profile updated!');
    // Optionally update token if returned
    if (data.token) localStorage.setItem('token', data.token);
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      alert(err.response.data.message);
    } else {
      alert('Error connecting to server.');
    }
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

initDashboard();

// Tab switching
const tabs = document.querySelectorAll('.dashboard-tab');
const panels = {
  listings: document.getElementById('dashboardListings'),
  orders: document.getElementById('dashboardOrders'),
  profile: document.getElementById('dashboardProfile')
};

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.keys(panels).forEach(key => {
      panels[key].style.display = (tab.dataset.tab === key) ? '' : 'none';
    });
  });
});

// Render listings
function renderListings() {
  const table = panels.listings.querySelector('.dashboard-table');
  if (user.listings.length === 0) {
    table.innerHTML = '<p>No listings found.</p>';
    return;
  }
  table.innerHTML = `<table><thead><tr><th>Name</th><th>Price</th><th>Status</th></tr></thead><tbody>
    ${user.listings.map(l => `<tr><td>${l.name}</td><td>₹${l.price}</td><td>${l.status}</td></tr>`).join('')}
  </tbody></table>`;
}

// Render orders
function renderOrders() {
  const table = panels.orders.querySelector('.dashboard-table');
  if (user.orders.length === 0) {
    table.innerHTML = '<p>No orders found.</p>';
    return;
  }
  table.innerHTML = `<table><thead><tr><th>Item</th><th>Price</th><th>Status</th></tr></thead><tbody>
    ${user.orders.map(o => `<tr><td>${o.item}</td><td>₹${o.price}</td><td>${o.status}</td></tr>`).join('')}
  </tbody></table>`;
}

renderListings();
renderOrders();

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

// Optionally, add logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/views/login.html';
  });
}

// Add event listeners for delete buttons after rendering users
adminPanels.users.addEventListener('click', async function(e) {
  if (e.target.classList.contains('delete-btn')) {
    const userId = e.target.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        alert('User deleted!');
        renderUsers(); // Refresh the user list
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          alert(err.response.data.message);
        } else {
          alert('Error connecting to server.');
        }
      }
    }
  }
});

adminPanels.users.addEventListener('click', async function(e) {
  if (e.target.classList.contains('edit-btn')) {
    const userId = e.target.getAttribute('data-id');
    const newName = prompt('Enter new name:');
    const newEmail = prompt('Enter new email:');
    const newRole = prompt('Enter new role (admin/user):');
    if (newName && newEmail && newRole) {
      try {
        const res = await axios.put(`${API_BASE_URL}/admin/users/${userId}`, { name: newName, email: newEmail, role: newRole }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        alert('User updated!');
        renderUsers(); // Refresh the user list
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          alert(err.response.data.message);
        } else {
          alert('Error connecting to server.');
        }
      }
    }
  }
}); 