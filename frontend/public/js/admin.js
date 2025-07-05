
const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'admin' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' }
];

const products = [
    { id: 1, name: 'Vintage Denim Jacket', price: 1299, seller: 'Alice', status: 'Active' },
    { id: 2, name: 'Leather Handbag', price: 1599, seller: 'Bob', status: 'Sold' },
    { id: 3, name: 'Kids Graphic Tee', price: 299, seller: 'Charlie', status: 'Active' }
];


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


function renderUsers() {
    const table = adminPanels.users.querySelector('.admin-table');
    if (users.length === 0) {
        table.innerHTML = '<p>No users found.</p>';
        return;
    }
    table.innerHTML = `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>
    ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td><button class='edit-btn'>Edit</button> <button class='delete-btn'>Delete</button></td></tr>`).join('')}
  </tbody></table>`;
}


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
// Optionally, add logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/frontend/views/login.html';
  });
} 