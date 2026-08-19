/**
 * Student Registration Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const alertContainer = document.getElementById('alertContainer');
  const submitBtn = document.getElementById('submitBtn');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Client-side validation
    if (!fullName) {
      showAlert('Please enter your full name.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert('Please provide a valid email address.', 'warning');
      return;
    }

    if (!password || password.length < 6) {
      showAlert('Password must be at least 6 characters in length.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please verify and re-enter.', 'warning');
      return;
    }

    // Disable button during registration
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Creating Account...`;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('Registration successful! Welcome to the portal. Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        showAlert(result.message || 'Registration failed. Please try again.', 'danger');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-person-plus-fill me-2"></i>Create Student Account`;
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert('Unable to connect to the server. Please check backend connection.', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-person-plus-fill me-2"></i>Create Student Account`;
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
