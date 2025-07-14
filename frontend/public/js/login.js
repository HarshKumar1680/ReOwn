const API_BASE_URL = "http://localhost:5000/api";
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Check session status on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' });
    const data = await res.json();
    if (data.loggedIn) {
      loginForm.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
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

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }
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
      // Redirect based on user role
      if (data.user && data.user.role === 'admin') {
        window.location.href = '/views/admin.html';
      } else {
        window.location.href = '/views/index.html';
      }
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Error connecting to server.');
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