const API_BASE_URL = "http://localhost:5000/api";
const loginForm = document.getElementById('loginForm');

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
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      alert('Login successful!');
      if (data.role === 'admin') {
        window.location.href = '/frontend/views/admin.html';
      } else {
        window.location.href = '/frontend/views/index.html';
      }
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
}); 