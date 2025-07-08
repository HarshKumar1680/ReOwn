const API_BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem('token');

// Check if user is logged in and is admin
if (!token) {
  alert('You must be logged in as admin.');
  window.location.href = '/views/login.html';
}

// Verify admin role
async function verifyAdminRole() {
  try {
    const res = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = res.data;
    if (!data || data.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      localStorage.removeItem('token');
      window.location.href = '/views/login.html';
    }
  } catch (err) {
    alert('Error verifying admin access.');
    window.location.href = '/views/login.html';
  }
}

// Fetch users from backend
async function fetchUsers() {
  try {
    const res = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/views/login.html';
      return [];
    }
    console.error('Error fetching users:', err);
    alert('Error fetching users: ' + err.message);
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
      adminPanels[key].style.display = (tab.dataset.tab === key) ? 'block' : 'none';
    });
  });
});

// Render users with better styling
async function renderUsers() {
  const users = await fetchUsers();
  const table = adminPanels.users.querySelector('.admin-table');
  
  if (users.length === 0) {
    table.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No users found.</p>';
    return;
  }
  
  table.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Name</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Email</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Role</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px;">${user.name}</td>
            <td style="padding: 12px;">${user.email}</td>
            <td style="padding: 12px;">
              <span style="padding: 4px 8px; border-radius: 12px; font-size: 0.8em; 
                background: ${user.role === 'admin' ? '#ff6b6b' : '#4ecdc4'}; 
                color: white;">
                ${user.role}
              </span>
            </td>
            <td style="padding: 12px;">
              <button class="edit-btn" data-id="${user._id}" 
                style="background: #4ecdc4; color: white; border: none; padding: 6px 12px; 
                border-radius: 4px; cursor: pointer; margin-right: 8px;">
                Edit
              </button>
              <button class="delete-btn" data-id="${user._id}" 
                style="background: #ff6b6b; color: white; border: none; padding: 6px 12px; 
                border-radius: 4px; cursor: pointer;">
                Delete
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Render products (placeholder for now)
function renderProducts() {
  const table = adminPanels.products.querySelector('.admin-table');
  table.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Product management coming soon...</p>';
}

// Initialize admin panel
async function initAdminPanel() {
  await verifyAdminRole();
  await renderUsers();
  renderProducts();
}

// Event delegation for user actions
document.addEventListener('DOMContentLoaded', function() {
  // Handle clicks on the users panel
  adminPanels.users.addEventListener('click', async function(e) {
    const target = e.target;
    
    // Handle delete button
    if (target.classList.contains('delete-btn')) {
      const userId = target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
          const res = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          
          if (res.ok) {
            alert('User deleted successfully!');
            await renderUsers(); // Refresh the user list
          } else {
            const data = await res.json();
            alert('Delete failed: ' + (data.message || res.statusText));
          }
        } catch (err) {
          console.error('Error deleting user:', err);
          alert('Error deleting user: ' + err.message);
        }
      }
    }
    
    // Handle edit button
    if (target.classList.contains('edit-btn')) {
      const userId = target.getAttribute('data-id');
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if (res.ok) {
          const user = await res.json();
          // Populate modal with user data
          document.getElementById('editUserId').value = user._id;
          document.getElementById('editUserName').value = user.name;
          document.getElementById('editUserEmail').value = user.email;
          document.getElementById('editUserRole').value = user.role;
          document.getElementById('editUserModal').style.display = 'block';
        } else {
          const data = await res.json();
          alert('Update failed: ' + (data.message || res.statusText));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        alert('Error fetching user data. Please try again.');
      }
    }
  });
});

// Modal functionality
const editUserModal = document.getElementById('editUserModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Close modal functions
function closeModal() {
  editUserModal.style.display = 'none';
}

closeEditModal.onclick = closeModal;
cancelEditBtn.onclick = closeModal;

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target === editUserModal) {
    closeModal();
  }
};

// Handle edit form submission
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
    const res = await axios.put(`${API_BASE_URL}/admin/users/${userId}`, { name, email, role }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alert('User updated successfully!');
      closeModal();
      await renderUsers(); // Refresh the user list
    } else {
      alert('Update failed: ' + (data.message || res.statusText));
    }
  } catch (err) {
    console.error('Error updating user:', err);
    alert('Error updating user. Please try again.');
  }
});

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      window.location.href = '/views/login.html';
    }
  });
}

// Initialize the admin panel when page loads
initAdminPanel(); 