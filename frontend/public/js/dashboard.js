const user = {
  name: 'User',
  email: 'user@example.com',
  listings: [
    { id: 1, name: 'Vintage Denim Jacket', price: 1299, status: 'Active' },
    { id: 2, name: 'Leather Handbag', price: 1599, status: 'Sold' }
  ],
  orders: [
    { id: 101, item: 'Floral Summer Dress', price: 899, status: 'Delivered' },
    { id: 102, item: 'Kids Graphic Tee', price: 299, status: 'Shipped' }
  ]
};

document.getElementById('userName').textContent = user.name;
document.getElementById('profileName').value = user.name;
document.getElementById('profileEmail').value = user.email;


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


const profileForm = document.getElementById('profileForm');
profileForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  if (!name || !email) {
    alert('Please fill in all fields.');
    return;
  }

  alert('Profile updated (placeholder)!');
}); 