// Session-based authentication utilities
const API_BASE_URL = 'http://localhost:5000/api';

// Check if user is authenticated using session
async function isAuthenticated() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, { 
      credentials: 'include' 
    });
    const data = await response.json();
    return data.loggedIn;
  } catch (error) {
    return false;
  }
}

// Get current user info from session
async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, { 
      credentials: 'include' 
    });
    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
}

// Session-based navbar management
async function updateNavbar() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/session`, { 
      credentials: 'include' 
    });
    const data = await response.json();
    
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (data.loggedIn) {
      // User is logged in - hide login/signup, show logout
      if (loginLink) loginLink.style.display = 'none';
      if (signupLink) signupLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'inline';
    } else {
      // User is not logged in - show login/signup, hide logout
      if (loginLink) loginLink.style.display = 'inline';
      if (signupLink) signupLink.style.display = 'inline';
      if (logoutLink) logoutLink.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking session:', error);
    // Fallback: show login/signup
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutLink = document.getElementById('logoutLink');
    if (loginLink) loginLink.style.display = 'inline';
    if (signupLink) signupLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
  }
}

// Add logout functionality
function setupLogout() {
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        window.location.reload();
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
      }
    });
  }
}

// Protect page - redirect to login if not authenticated
async function protectPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    alert('Please login to access this page.');
    window.location.href = '/views/login.html';
    return false;
  }
  return true;
}

// Initialize session-based features
async function initSession() {
  await updateNavbar();
  setupLogout();
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSession); 