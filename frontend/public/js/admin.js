const API_BASE_URL = "http://localhost:5000/api";

// Utility: fetch with credentials
async function apiFetch(url, options = {}) {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
  return res.json();
}

// Product CRUD
async function fetchProducts() {
  const data = await apiFetch(`${API_BASE_URL}/products`);
  allProducts = data.data || [];
  return allProducts;
}
async function addProduct(product) {
  return apiFetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
}
async function updateProduct(id, product) {
  return apiFetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
}
async function deleteProduct(id) {
  return apiFetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
}

// User CRUD (fetch only)
async function fetchUsers() {
  const res = await apiFetch(`${API_BASE_URL}/admin/users`);
  allUsers = res;
  return allUsers;
}

// User update and delete
async function updateUser(id, user) {
  return apiFetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
}
async function deleteUser(id) {
  return apiFetch(`${API_BASE_URL}/admin/users/${id}`, { method: 'DELETE' });
}

// DOM Elements
const adminPanels = {
  products: document.getElementById('adminProducts')
};
const addProductBtn = document.getElementById('addProductBtn');
const addProductModal = document.getElementById('addProductModal');
const editProductModal = document.getElementById('editProductModal');
const deleteProductModal = document.getElementById('deleteProductModal');

// User modal elements
const editUserModal = document.getElementById('editUserModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editUserForm = document.getElementById('editUserForm');
let editingUserId = null;

// Modal open/close helpers
function openModal(modal) { modal.style.display = 'block'; }
function closeModal(modal) { modal.style.display = 'none'; }
window.onclick = function(event) {
  [addProductModal, editProductModal, deleteProductModal, editUserModal].forEach(modal => {
    if (event.target === modal) closeModal(modal);
  });
};

// Store last fetched users/products for search
let allUsers = [];
let allProducts = [];

// User search logic
const userSearchInput = document.getElementById('userSearchInput');
userSearchInput.addEventListener('input', () => renderUsers());

// Product search logic
const productSearchInput = document.getElementById('productSearchInput');
productSearchInput.addEventListener('input', () => renderProducts());

// Render products table
async function renderProducts() {
  const table = adminPanels.products.querySelector('.admin-table');
  table.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">Loading...</p>';
  try {
    if (!allProducts.length) await fetchProducts();
    let products = allProducts;
    const search = productSearchInput.value.trim().toLowerCase();
    if (search) {
      products = products.filter(p => p.name.toLowerCase().includes(search));
    }
    if (!products.length) {
      table.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">No products found.</p>';
      return;
    }
    table.innerHTML = `
      <table style="width:100%;border-collapse:collapse;margin-top:1rem;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:12px;text-align:left;">Name</th>
            <th style="padding:12px;text-align:left;">Category</th>
            <th style="padding:12px;text-align:left;">Price</th>
            <th style="padding:12px;text-align:left;">Stock</th>
            <th style="padding:12px;text-align:left;">Status</th>
            <th style="padding:12px;text-align:left;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td style="padding:12px;">${product.name}</td>
              <td style="padding:12px;">${product.category}</td>
              <td style="padding:12px;">₹${product.price}</td>
              <td style="padding:12px;">${product.stock}</td>
              <td style="padding:12px;">
                <span style="padding:4px 8px;border-radius:12px;font-size:0.8em;background:${product.isActive ? '#4ecdc4' : '#ff6b6b'};color:white;">
                  ${product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style="padding:12px;">
                <button class="edit-product-btn cta-btn" data-id="${product._id}">Edit</button>
                <button class="delete-product-btn cta-btn" style="background:#ff6b6b;color:white;" data-id="${product._id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    table.innerHTML = `<p style='color:red;text-align:center;'>${err.message}</p>`;
  }
}

// Render users table
async function renderUsers() {
  const usersPanel = document.getElementById('adminUsers');
  const table = usersPanel.querySelector('.admin-table');
  table.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">Loading...</p>';
  try {
    if (!allUsers.length) await fetchUsers();
    let users = allUsers;
    const search = userSearchInput.value.trim().toLowerCase();
    if (search) {
      users = users.filter(u => u.name.toLowerCase().includes(search));
    }
    if (!users.length) {
      table.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">No users found.</p>';
      return;
    }
    table.innerHTML = `
      <table style="width:100%;border-collapse:collapse;margin-top:1rem;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:12px;text-align:left;">Name</th>
            <th style="padding:12px;text-align:left;">Email</th>
            <th style="padding:12px;text-align:left;">Role</th>
            <th style="padding:12px;text-align:left;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td style="padding:12px;">${user.name}</td>
              <td style="padding:12px;">${user.email}</td>
              <td style="padding:12px;">${user.role}</td>
              <td style="padding:12px;">
                <button class="edit-user-btn cta-btn" data-id="${user._id}">Edit</button>
                <button class="delete-user-btn cta-btn" style="background:#ff6b6b;color:white;" data-id="${user._id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    // Add event listeners for edit/delete
    table.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.onclick = async function() {
        const id = btn.getAttribute('data-id');
        editingUserId = id;
        // Fetch user details
        const user = users.find(u => u._id === id);
        document.getElementById('editUserId').value = user._id;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        openModal(editUserModal);
      };
    });
    table.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.onclick = function() {
        const id = btn.getAttribute('data-id');
        confirmDeleteUser(id);
      };
    });
  } catch (err) {
    table.innerHTML = `<p style='color:red;text-align:center;'>${err.message}</p>`;
  }
}

// Add Product Modal logic
addProductBtn.onclick = () => {
  document.getElementById('addProductForm').reset();
  openModal(addProductModal);
};
document.getElementById('closeAddProductModal').onclick = () => closeModal(addProductModal);
document.getElementById('cancelAddProductBtn').onclick = () => closeModal(addProductModal);
document.getElementById('addProductForm').onsubmit = async function(e) {
  e.preventDefault();
  const product = {
    name: document.getElementById('addProductName').value,
    category: document.getElementById('addProductCategory').value,
    price: Number(document.getElementById('addProductPrice').value),
    stock: Number(document.getElementById('addProductStock').value),
    isActive: document.getElementById('addProductStatus').value === 'true'
  };
  try {
    await addProduct(product);
    closeModal(addProductModal);
    await renderProducts();
    alert('Product added!');
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// Edit Product Modal logic
let editingProductId = null;
document.getElementById('closeEditProductModal').onclick = () => closeModal(editProductModal);
document.getElementById('cancelEditProductBtn').onclick = () => closeModal(editProductModal);
document.getElementById('editProductForm').onsubmit = async function(e) {
  e.preventDefault();
  const product = {
    name: document.getElementById('editProductName').value,
    category: document.getElementById('editProductCategory').value,
    price: Number(document.getElementById('editProductPrice').value),
    stock: Number(document.getElementById('editProductStock').value),
    isActive: document.getElementById('editProductStatus').value === 'true'
  };
  try {
    await updateProduct(editingProductId, product);
    closeModal(editProductModal);
    await renderProducts();
    alert('Product updated!');
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// Delete Product Modal logic
let deletingProductId = null;
document.getElementById('closeDeleteProductModal').onclick = () => closeModal(deleteProductModal);
document.getElementById('cancelDeleteProductBtn').onclick = () => closeModal(deleteProductModal);
document.getElementById('confirmDeleteProductBtn').onclick = async function() {
  try {
    await deleteProduct(deletingProductId);
    closeModal(deleteProductModal);
    await renderProducts();
    alert('Product deleted!');
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// User edit logic
closeEditModal.onclick = closeModal.bind(null, editUserModal);
cancelEditBtn.onclick = closeModal.bind(null, editUserModal);

editUserForm.onsubmit = async function(e) {
  e.preventDefault();
  const user = {
    name: document.getElementById('editUserName').value,
    email: document.getElementById('editUserEmail').value,
    role: document.getElementById('editUserRole').value
  };
  try {
    await updateUser(editingUserId, user);
    closeModal(editUserModal);
    await renderUsers();
    alert('User updated!');
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// User delete logic
let deletingUserId = null;
// Add a simple confirm dialog for delete
function confirmDeleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    deleteUser(id).then(() => {
      renderUsers();
      alert('User deleted!');
    }).catch(err => {
      alert('Error: ' + err.message);
    });
  }
}

// Event delegation for edit/delete buttons
adminPanels.products.addEventListener('click', async function(e) {
  if (e.target.classList.contains('edit-product-btn')) {
    const id = e.target.getAttribute('data-id');
    editingProductId = id;
    // Fetch product details
    try {
      const res = await apiFetch(`${API_BASE_URL}/products/${id}`);
      const p = res.data;
      document.getElementById('editProductId').value = p._id;
      document.getElementById('editProductName').value = p.name;
      document.getElementById('editProductCategory').value = p.category;
      document.getElementById('editProductPrice').value = p.price;
      document.getElementById('editProductStock').value = p.stock;
      document.getElementById('editProductStatus').value = p.isActive ? 'true' : 'false';
      openModal(editProductModal);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
  if (e.target.classList.contains('delete-product-btn')) {
    deletingProductId = e.target.getAttribute('data-id');
    openModal(deleteProductModal);
  }
});

// Tab switching logic
const adminTabs = document.querySelectorAll('.admin-tab');
const adminPanelsAll = {
  users: document.getElementById('adminUsers'),
  products: document.getElementById('adminProducts')
};
adminTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    adminTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.keys(adminPanelsAll).forEach(key => {
      adminPanelsAll[key].style.display = (tab.dataset.tab === key) ? 'block' : 'none';
    });
    if (tab.dataset.tab === 'users') renderUsers();
    if (tab.dataset.tab === 'products') renderProducts();
  });
});

// Initial render
renderUsers();
renderProducts();

// Logout button logic
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async function() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        window.location.href = '/views/login.html';
      } catch (error) {
        alert('Logout failed. Please try again.');
      }
    }
  });
} 