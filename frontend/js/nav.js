/**
 * Dynamic Navigation Bar Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar();
});

async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated && data.user) {
        return data.user;
      }
    }
  } catch (error) {
    console.error('Error fetching user status:', error);
  }
  return null;
}

async function renderNavbar() {
  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  const user = await getCurrentUser();
  const currentPath = window.location.pathname;

  const isActive = (path) => {
    if (path === '/' && (currentPath === '/' || currentPath.endsWith('index.html') || currentPath === '')) {
      return 'active';
    }
    return currentPath.includes(path) ? 'active' : '';
  };

  let navLinksHtml = `
    <li class="nav-item">
      <a class="nav-link ${isActive('index.html')}" href="index.html">
        <i class="bi bi-house-door me-1"></i>Home
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link ${isActive('courses.html')}" href="courses.html">
        <i class="bi bi-journal-bookmark me-1"></i>Courses
      </a>
    </li>
  `;

  let authLinksHtml = '';

  if (!user) {
    // Guest Links
    authLinksHtml = `
      <div class="d-flex align-items-center gap-2">
        <a href="login.html" class="btn btn-outline-primary btn-sm px-3">
          <i class="bi bi-box-arrow-in-right me-1"></i>Log In
        </a>
        <a href="register.html" class="btn btn-primary btn-sm px-3">
          <i class="bi bi-person-plus me-1"></i>Register
        </a>
      </div>
    `;
  } else if (user.role === 'student') {
    // Student Links
    navLinksHtml += `
      <li class="nav-item">
        <a class="nav-link ${isActive('my-courses.html')}" href="my-courses.html">
          <i class="bi bi-collection-play me-1"></i>My Courses
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${isActive('dashboard.html')}" href="dashboard.html">
          <i class="bi bi-speedometer2 me-1"></i>Dashboard
        </a>
      </li>
    `;

    authLinksHtml = `
      <div class="dropdown">
        <button class="btn btn-light dropdown-toggle d-flex align-items-center gap-2 border" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle text-primary fs-5"></i>
          <span class="fw-semibold">${escapeHtml(user.full_name)}</span>
          <span class="user-badge badge-student">Student</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userMenuButton">
          <li><h6 class="dropdown-header">${escapeHtml(user.email)}</h6></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
          <li><a class="dropdown-item" href="my-courses.html"><i class="bi bi-collection-play me-2"></i>My Enrolled Courses</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item text-danger" id="logoutBtn" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i>Log Out</button></li>
        </ul>
      </div>
    `;
  } else if (user.role === 'admin') {
    // Admin Links
    navLinksHtml += `
      <li class="nav-item">
        <a class="nav-link ${isActive('admin.html')}" href="admin.html">
          <i class="bi bi-gear-fill me-1"></i>Admin Panel
        </a>
      </li>
    `;

    authLinksHtml = `
      <div class="dropdown">
        <button class="btn btn-light dropdown-toggle d-flex align-items-center gap-2 border" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-shield-lock-fill text-danger fs-5"></i>
          <span class="fw-semibold">${escapeHtml(user.full_name)}</span>
          <span class="user-badge badge-admin">Admin</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userMenuButton">
          <li><h6 class="dropdown-header">${escapeHtml(user.email)}</h6></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="admin.html"><i class="bi bi-gear me-2"></i>Manage Courses</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item text-danger" id="logoutBtn" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i>Log Out</button></li>
        </ul>
      </div>
    `;
  }

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-custom sticky-top">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <i class="bi bi-mortarboard-fill text-primary"></i>
          <span>EduPortal</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain" aria-controls="navbarMain" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarMain">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${navLinksHtml}
          </ul>
          <div class="d-flex align-items-center">
            ${authLinksHtml}
          </div>
        </div>
      </div>
    </nav>
  `;
}

async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      window.location.href = 'login.html';
    } else {
      alert('Failed to log out. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = 'login.html';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
