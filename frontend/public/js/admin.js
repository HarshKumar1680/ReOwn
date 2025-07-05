const API_BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem('token');

if (!token) {
  alert('You must be logged in as admin.');
  window.location.href = '/frontend/views/login.html';
}

// Fetch users from backend
async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Not authorized or error fetching users');
    return await res.json();
  } catch (err) {
    alert(err.message);
    return [];
  }
}

// Tab switching
const adminTabs = document.querySelectorAll('.admin-tab');
const adminPanels = {
  users: document.getElementById('adminUsers'),
  products: document.getElementById('adminProducts')
};

adminTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    adminTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.keys(adminPanels).forEach(key => {
      adminPanels[key].style.display = (tab.dataset.tab === key) ? '' : 'none';
    });
  });
});

// Render users
async function renderUsers() {
  const users = await fetchUsers();
  const table = adminPanels.users.querySelector('.admin-table');
  if (users.length === 0) {
    table.innerHTML = '<p>No users found.</p>';
    return;
  }
  table.innerHTML = `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>
    ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td><button class='edit-btn' data-id='${u._id}'>Edit</button> <button class='delete-btn' data-id='${u._id}'>Delete</button></td></tr>`).join('')}
  </tbody></table>`;
}

// Render products
function renderProducts() {
  const table = adminPanels.products.querySelector('.admin-table');
  if (products.length === 0) {
    table.innerHTML = '<p>No products found.</p>';
    return;
  }
  table.innerHTML = `<table><thead><tr><th>Name</th><th>Price</th><th>Seller</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${products.map(p => `<tr><td>${p.name}</td><td>₹${p.price}</td><td>${p.seller}</td><td>${p.status}</td><td><button class='edit-btn'>Edit</button> <button class='delete-btn'>Delete</button></td></tr>`).join('')}
  </tbody></table>`;
}

renderUsers();
renderProducts();

// Add event listeners for edit and delete buttons using event delegation
adminPanels.users.addEventListener('click', async function(e) {
  if (e.target.classList.contains('delete-btn')) {
    const userId = e.target.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (res.ok) {
          alert('User deleted!');
          renderUsers(); // Refresh the user list
        } else {
          alert(data.message || 'Delete failed');
        }
      } catch (err) {
        alert('Error connecting to server.');
      }
    }
  }
  if (e.target.classList.contains('edit-btn')) {
    const userId = e.target.getAttribute('data-id');
    // Fetch user data to prefill modal
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const user = await res.json();
      if (res.ok) {
        document.getElementById('editUserId').value = user._id;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editUserModal').style.display = 'block';
      } else {
        alert(user.message || 'Could not fetch user data');
      }
    } catch (err) {
      alert('Error fetching user data.');
    }
  }
});

// Modal logic
const editUserModal = document.getElementById('editUserModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
closeEditModal.onclick = cancelEditBtn.onclick = function() {
  editUserModal.style.display = 'none';
};
window.onclick = function(event) {
  if (event.target === editUserModal) {
    editUserModal.style.display = 'none';
  }
};

// Handle save in modal
const editUserForm = document.getElementById('editUserForm');
editUserForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const userId = document.getElementById('editUserId').value;
  const name = document.getElementById('editUserName').value.trim();
  const email = document.getElementById('editUserEmail').value.trim();
  const role = document.getElementById('editUserRole').value;
  if (!name || !email || !role) {
    alert('All fields are required.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ name, email, role })
    });
    const data = await res.json();
    if (res.ok) {
      alert('User updated!');
      editUserModal.style.display = 'none';
      renderUsers();
    } else {
      alert(data.message || 'Update failed');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
});

// Optionally, add logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/frontend/views/login.html';
  });
} 