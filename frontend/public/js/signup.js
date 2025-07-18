const API_BASE_URL = "http://localhost:5000/api";
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');

// Check session status on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' });
    const data = await res.json();
    if (data.loggedIn) {
      signupForm.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
      signupForm.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  } catch (err) {
    // fallback: show signup
    signupForm.style.display = 'block';
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
function validateName(name) {
  return name.length >= 2;
}
function setupInputIconsAndValidation() {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
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

signupForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }
  if (!validateName(name)) {
    alert('Name must be at least 2 characters.');
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
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Signup successful! Please login.');
      hideSpinner();
      showConfettiCheck();
      setTimeout(() => { window.location.href = '/views/login.html'; }, 900);
    } else {
      alert(data.message || 'Signup failed');
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