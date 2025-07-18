// Protect admin page: only allow logged-in admins
(async function protectAdminPage() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/session', { credentials: 'include' });
    const data = await res.json();
    if (!data.loggedIn) {
      window.location.href = '/views/login.html';
    } else if (!data.user || data.user.role !== 'admin') {
      alert('Admins only!');
      window.location.href = '/views/index.html';
    }
  } catch {
    window.location.href = '/views/login.html';
  }
})();

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

// --- Admin Orders Management ---
const adminOrdersPanel = document.getElementById('adminOrders');
const adminOrdersTableBody = document.getElementById('adminOrdersTableBody');
const adminOrdersEmpty = document.getElementById('adminOrdersEmpty');
const orderDetailsModal = document.getElementById('orderDetailsModal');
const orderDetailsContent = document.getElementById('orderDetailsContent');
const closeOrderDetails = document.getElementById('closeOrderDetails');

async function fetchAllOrders() {
  try {
    const res = await fetch('http://localhost:5000/api/orders', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch orders');
    return data.data;
  } catch (err) {
    adminOrdersTableBody.innerHTML = '';
    adminOrdersEmpty.style.display = 'block';
    return [];
  }
}

function renderAdminOrders(orders) {
  adminOrdersTableBody.innerHTML = '';
  if (!orders.length) {
    adminOrdersEmpty.style.display = 'block';
    return;
  }
  adminOrdersEmpty.style.display = 'none';
  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:12px;">${new Date(order.createdAt).toLocaleString()}</td>
      <td>${order.user ? order.user.name : 'N/A'}</td>
      <td><span class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span><br><span style="font-size:0.9em;color:#555;">Payment: ${order.paymentStatus || 'N/A'}</span></td>
      <td>₹${order.totalPrice}</td>
      <td><button class="cta-btn" data-id="${order._id}">Details</button></td>
      <td>
        <select class="order-status-select" data-id="${order._id}">
          <option value="processing"${order.status==='processing'?' selected':''}>Processing</option>
          <option value="shipped"${order.status==='shipped'?' selected':''}>Shipped</option>
          <option value="delivered"${order.status==='delivered'?' selected':''}>Delivered</option>
          <option value="cancelled"${order.status==='cancelled'?' selected':''}>Cancelled</option>
        </select>
        <div class="payment-actions" data-order-id="${order._id}"></div>
      </td>
    `;
    adminOrdersTableBody.appendChild(tr);
    // Add payment verification actions if needed
    if (order.paymentStatus === 'awaiting_verification') {
      const actionsDiv = tr.querySelector('.payment-actions');
      actionsDiv.innerHTML = `
        <button class="verify-payment-btn" data-action="paid" data-order-id="${order._id}" style="background:#4ecdc4;color:white;margin:2px 0;">Mark Paid</button>
        <button class="verify-payment-btn" data-action="failed" data-order-id="${order._id}" style="background:#ff6b6b;color:white;margin:2px 0;">Mark Failed</button>
      `;
    }
  });
  // Details button
  adminOrdersTableBody.querySelectorAll('button[data-id]').forEach(btn => {
    btn.onclick = () => showAdminOrderDetails(btn.getAttribute('data-id'));
  });
  // Status select
  adminOrdersTableBody.querySelectorAll('.order-status-select').forEach(sel => {
    sel.onchange = async function() {
      const orderId = sel.getAttribute('data-id');
      const status = sel.value;
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to update status');
        alert('Order status updated!');
        fetchAndRenderAdminOrders();
      } catch (err) {
        alert(err.message || 'Error updating status.');
      }
    };
  });
  // Payment verification actions
  adminOrdersTableBody.querySelectorAll('.verify-payment-btn').forEach(btn => {
    btn.onclick = async function() {
      const orderId = btn.getAttribute('data-order-id');
      const action = btn.getAttribute('data-action');
      btn.disabled = true;
      btn.textContent = 'Processing...';
      try {
        const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to verify payment');
        alert('Payment status updated!');
        fetchAndRenderAdminOrders();
      } catch (err) {
        alert(err.message || 'Error verifying payment.');
        btn.disabled = false;
        btn.textContent = action === 'paid' ? 'Mark Paid' : 'Mark Failed';
      }
    };
  });
}

async function showAdminOrderDetails(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch order details');
    const order = data.data;
    orderDetailsContent.innerHTML = `
      <h3>Order Details</h3>
      <div><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</div>
      <div><b>Status:</b> ${order.status}</div>
      <div><b>Payment Status:</b> ${order.paymentStatus || 'N/A'}</div>
      <div><b>User:</b> ${order.user ? order.user.name + ' (' + order.user.email + ')' : 'N/A'}</div>
      <div><b>Total:</b> ₹${order.totalPrice}</div>
      <div><b>Shipping:</b> ${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}${order.shippingAddress.phone ? ', ' + order.shippingAddress.phone : ''}</div>
      <div style="margin-top:1em;"><b>Items:</b></div>
      <ul style="margin:0 0 1em 1em;padding:0;">
        ${order.items.map(item => `<li>${item.quantity} x ${item.product && item.product.name ? item.product.name : item.product} @ ₹${item.price}</li>`).join('')}
      </ul>
      ${order.paymentProof && order.paymentProof.txnId ? `<div><b>Txn ID:</b> ${order.paymentProof.txnId}</div>` : ''}
    `;
    orderDetailsModal.style.display = 'block';
  } catch (err) {
    alert('Error loading order details.');
  }
}
if (closeOrderDetails) closeOrderDetails.onclick = function() { orderDetailsModal.style.display = 'none'; };
window.onclick = function(event) {
  if (event.target === orderDetailsModal) orderDetailsModal.style.display = 'none';
};

async function fetchAndRenderAdminOrders() {
  const orders = await fetchAllOrders();
  renderAdminOrders(orders);
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
function openModal(modal) {
  modal.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
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

// Tab switching logic (extend to include orders)
const adminTabs = document.querySelectorAll('.admin-tab');
const adminPanelsAll = {
  users: document.getElementById('adminUsers'),
  products: document.getElementById('adminProducts'),
  orders: document.getElementById('adminOrders')
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
    if (tab.dataset.tab === 'orders') fetchAndRenderAdminOrders();
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