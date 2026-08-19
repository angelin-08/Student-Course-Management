/**
 * User Login Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', async () => {
  // If user is already logged in, redirect them
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.authenticated && data.user) {
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
      return;
    }
  } catch (err) {
    // Continue with login page
  }

  const loginForm = document.getElementById('loginForm');
  const alertContainer = document.getElementById('alertContainer');
  const submitBtn = document.getElementById('submitBtn');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showAlert('Please fill in both email and password fields.', 'danger');
      return;
    }

    // Disable button during request
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...`;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          if (result.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 800);
      } else {
        showAlert(result.message || 'Invalid email or password. Please try again.', 'danger');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-box-arrow-in-right me-2"></i>Sign In`;
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Unable to connect to the server. Please ensure the backend is running.', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-box-arrow-in-right me-2"></i>Sign In`;
    }
  });

  function showAlert(message, type) {
    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center" role="alert">
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5"></i>
        <div>${escapeHtml(message)}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
