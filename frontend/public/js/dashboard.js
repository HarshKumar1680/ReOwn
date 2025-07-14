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
  table.innerHTML = '<p>No listings found.</p>';
}

// Render orders
function renderOrders() {
  const table = panels.orders.querySelector('.dashboard-table');
  table.innerHTML = '<p>No orders found.</p>';
}

renderListings();
renderOrders();