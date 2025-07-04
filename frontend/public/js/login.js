const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  alert('Login successful (placeholder)!');
}); 