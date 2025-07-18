const API_BASE_URL = "http://localhost:5000/api";
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Check session status on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' });
    const data = await res.json();
    if (data.loggedIn) {
      // Redirect logged-in users away from login page
      window.location.href = '/views/index.html';
      return;
    } else {
      loginForm.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  } catch (err) {
    // fallback: show login
    loginForm.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
});

// --- Spinner, Confetti, and Input Icon Logic ---
function showSpinner() {
  let spinner = document.createElement('div');
  spinner.className = 'spinner-overlay';
  spinner.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(spinner);
}
function hideSpinner() {
  let spinner = document.querySelector('.spinner-overlay');
  if (spinner) spinner.remove();
}
function showConfettiCheck() {
  let confetti = document.createElement('div');
  confetti.className = 'confetti';
  confetti.innerHTML = '<div class="success-checkmark">✔️</div>';
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 1200);
}
// --- Real-time validation ---
function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}
function validatePassword(pw) {
  return pw.length >= 6;
}
function setupInputIconsAndValidation() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
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
  if (passwordInput) {
    passwordInput.parentElement.classList.add('input-icon');
    if (!passwordInput.previousElementSibling || !passwordInput.previousElementSibling.classList.contains('icon')) {
      let icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = '🔒';
      passwordInput.parentElement.insertBefore(icon, passwordInput);
    }
    passwordInput.addEventListener('input', () => {
      if (validatePassword(passwordInput.value)) {
        passwordInput.classList.add('valid');
        passwordInput.classList.remove('invalid');
      } else {
        passwordInput.classList.remove('valid');
        passwordInput.classList.add('invalid');
      }
    });
  }
}
window.addEventListener('DOMContentLoaded', setupInputIconsAndValidation);

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }
  if (!validateEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }
  if (!validatePassword(password)) {
    alert('Password must be at least 6 characters.');
    return;
  }
  showSpinner();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert('Login successful!');
      hideSpinner();
      showConfettiCheck();
      // Redirect based on user role
      if (data.user && data.user.role === 'admin') {
        setTimeout(() => { window.location.href = '/views/admin.html'; }, 900);
      } else {
        setTimeout(() => { window.location.href = '/views/index.html'; }, 900);
      }
    } else {
      alert(data.message || 'Login failed');
      hideSpinner();
    }
  } catch (err) {
    alert('Error connecting to server.');
    hideSpinner();
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.reload();
    } catch (err) {
      alert('Logout failed.');
    }
  });
} 