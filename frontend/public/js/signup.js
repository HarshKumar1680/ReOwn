const API_BASE_URL = "http://localhost:5000/api";
const signupForm = document.getElementById('signupForm');

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
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Signup successful! Please login.');
      if (data.role === 'admin') {
        window.location.href = '/frontend/views/admin.html';
      } else {
        window.location.href = '/frontend/views/index.html';
      }
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
}); 