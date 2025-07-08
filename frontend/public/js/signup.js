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
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
    const data = res.data;
    if (res.status === 200) {
      alert('Signup successful! Please login.');
      if (data.role === 'admin') {
        window.location.href = '/views/admin.html';
      } else {
        window.location.href = '/views/index.html';
      }
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      alert(err.response.data.message);
    } else {
      alert('Error connecting to server.');
    }
  }
}); 