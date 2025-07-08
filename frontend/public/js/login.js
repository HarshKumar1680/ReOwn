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
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    const data = res.data;
    console.log('Login response:', data);
    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('Login successful!');
      if (data.role === 'admin') {
        window.location.href = '/views/admin.html';
      } else {
        window.location.href = '/views/index.html';
      }
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      alert(err.response.data.message);
    } else {
      alert('Error connecting to server.');
    }
  }
}); 