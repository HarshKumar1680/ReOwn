// Frontend served from http://localhost:5500
// Backend API at http://localhost:5000/api
const API_BASE_URL = 'http://localhost:5000/api';

async function isAuthenticated() {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/session`, { withCredentials: true });
    return response.data && response.data.loggedIn;
  } catch (error) {
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
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
        window.location.reload();
      } catch (error) {
        alert('Logout failed. Please try again.');
      }
    });
  }
}

// On page load
(async function() {
  await updateNavbar();
  setupLogout();
})(); 