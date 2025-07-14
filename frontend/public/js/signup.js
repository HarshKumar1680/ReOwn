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

signupForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }
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
      window.location.href = '/views/login.html';
    } else {
      alert(data.message || 'Signup failed');
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