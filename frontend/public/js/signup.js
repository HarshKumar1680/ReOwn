const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  alert('Signup successful (placeholder)!');
}); 