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

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const thankYouMsg = document.getElementById('thankYouMsg');
  if (thankYouMsg) thankYouMsg.style.display = 'none';

  if (contactForm) {
    contactForm.onsubmit = async function(e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      try {
        const response = await axios.post(`${API_BASE_URL}/contact`, { name, email, message });
        if (response.data && response.data.success) {
          if (thankYouMsg) thankYouMsg.style.display = 'block';
          contactForm.reset();
        } else {
          alert(response.data.message || 'Failed to send message.');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error sending message.');
      }
    };
  }
});

// On page load
(async function() {
  await updateNavbar();
  setupLogout();
})(); 