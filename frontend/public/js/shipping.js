const API_BASE_URL = 'http://localhost:5000/api';

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
        alert('Logout failed. Please try again.');
      }
    });
  }
}

const shippingForm = document.getElementById('shippingForm');
shippingForm.onsubmit = function(e) {
  e.preventDefault();
  const address = {
    fullName: document.getElementById('shipFullName').value,
    address: document.getElementById('shipAddress').value,
    city: document.getElementById('shipCity').value,
    postalCode: document.getElementById('shipPostalCode').value,
    country: document.getElementById('shipCountry').value,
    phone: document.getElementById('shipPhone').value
  };
  localStorage.setItem('shippingAddress', JSON.stringify(address));
  window.location.href = '/views/checkout.html';
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
  // Optionally prefill if address exists
  const saved = localStorage.getItem('shippingAddress');
  if (saved) {
    try {
      const addr = JSON.parse(saved);
      if (addr.fullName) document.getElementById('shipFullName').value = addr.fullName;
      if (addr.address) document.getElementById('shipAddress').value = addr.address;
      if (addr.city) document.getElementById('shipCity').value = addr.city;
      if (addr.postalCode) document.getElementById('shipPostalCode').value = addr.postalCode;
      if (addr.country) document.getElementById('shipCountry').value = addr.country;
      if (addr.phone) document.getElementById('shipPhone').value = addr.phone;
    } catch {}
  }
})(); 