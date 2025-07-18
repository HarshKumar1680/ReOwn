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

// --- Input Icons & Real-time Validation ---
function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}
function validateName(name) {
  return name.length >= 2;
}
function validateMessage(msg) {
  return msg.length >= 5;
}
function setupInputIconsAndValidation() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  if (nameInput) {
    nameInput.parentElement.classList.add('input-icon');
    if (!nameInput.previousElementSibling || !nameInput.previousElementSibling.classList.contains('icon')) {
      let icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = '👤';
      nameInput.parentElement.insertBefore(icon, nameInput);
    }
    nameInput.addEventListener('input', () => {
      if (validateName(nameInput.value)) {
        nameInput.classList.add('valid');
        nameInput.classList.remove('invalid');
      } else {
        nameInput.classList.remove('valid');
        nameInput.classList.add('invalid');
      }
    });
  }
  if (emailInput) {
    emailInput.parentElement.classList.add('input-icon');
    if (!emailInput.previousElementSibling || !emailInput.previousElementSibling.classList.contains('icon')) {
      let icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = '📧';
      emailInput.parentElement.insertBefore(icon, emailInput);
    }
    emailInput.addEventListener('input', () => {
      if (validateEmail(emailInput.value)) {
        emailInput.classList.add('valid');
        emailInput.classList.remove('invalid');
      } else {
        emailInput.classList.remove('valid');
        emailInput.classList.add('invalid');
      }
    });
  }
  if (messageInput) {
    messageInput.parentElement.classList.add('input-icon');
    if (!messageInput.previousElementSibling || !messageInput.previousElementSibling.classList.contains('icon')) {
      let icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = '💬';
      messageInput.parentElement.insertBefore(icon, messageInput);
    }
    messageInput.addEventListener('input', () => {
      if (validateMessage(messageInput.value)) {
        messageInput.classList.add('valid');
        messageInput.classList.remove('invalid');
      } else {
        messageInput.classList.remove('valid');
        messageInput.classList.add('invalid');
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
  setupInputIconsAndValidation();
});

// On page load
(async function() {
  await updateNavbar();
  setupLogout();
})(); 