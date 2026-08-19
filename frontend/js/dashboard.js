/**
 * Student Dashboard Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', async () => {
  let currentUser = null;

  // 1. Authenticate user
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (!data.authenticated || !data.user) {
      window.location.href = 'login.html';
      return;
    }
    if (data.user.role === 'admin') {
      window.location.href = 'admin.html';
      return;
    }
    currentUser = data.user;
    document.getElementById('studentNameGreeting').textContent = currentUser.full_name;
  } catch (err) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Fetch and render dashboard stats
  await loadDashboardStats();

  // 3. Setup Drop Modal confirmation event
  const confirmDropBtn = document.getElementById('confirmDropBtn');
  let selectedEnrollmentId = null;
  let selectedCourseName = '';

  window.openDropModal = function(enrollmentId, courseName) {
    selectedEnrollmentId = enrollmentId;
    selectedCourseName = courseName;
    document.getElementById('dropCourseNameSpan').textContent = courseName;
    const dropModal = new bootstrap.Modal(document.getElementById('dropConfirmModal'));
    dropModal.show();
  };

  confirmDropBtn.addEventListener('click', async () => {
    if (!selectedEnrollmentId) return;

    confirmDropBtn.disabled = true;
    confirmDropBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Dropping...`;

    try {
      const response = await fetch(`/api/enrollments/${selectedEnrollmentId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      const dropModalEl = document.getElementById('dropConfirmModal');
      const dropModalInstance = bootstrap.Modal.getInstance(dropModalEl);
      if (dropModalInstance) dropModalInstance.hide();

      if (response.ok && result.success) {
        showDashboardAlert(`Successfully dropped "${selectedCourseName}".`, 'success');
        await loadDashboardStats();
      } else {
        showDashboardAlert(result.message || 'Failed to drop course.', 'danger');
      }
    } catch (error) {
      console.error('Error dropping course:', error);
      showDashboardAlert('Error communicating with server.', 'danger');
    } finally {
      confirmDropBtn.disabled = false;
      confirmDropBtn.innerHTML = 'Yes, Drop Course';
      selectedEnrollmentId = null;
    }
  });

  async function loadDashboardStats() {
    const tableBody = document.getElementById('recentEnrollmentsTableBody');
    const loadingPlaceholder = document.getElementById('enrollmentsLoading');
    const emptyState = document.getElementById('emptyEnrollmentsState');

    try {
      const response = await fetch('/api/enrollments/dashboard-stats');
      const result = await response.json();

      if (response.ok && result.success) {
        const stats = result.data;
        document.getElementById('statTotalCourses').textContent = stats.total_courses;
        document.getElementById('statEnrolledCourses').textContent = stats.enrolled_courses;
        document.getElementById('statAvailableCourses').textContent = stats.available_courses;

        loadingPlaceholder.classList.add('d-none');

        if (stats.recent_enrollments.length === 0) {
          emptyState.classList.remove('d-none');
          tableBody.innerHTML = '';
        } else {
          emptyState.classList.add('d-none');
          tableBody.innerHTML = stats.recent_enrollments.map(item => {
            const dateStr = new Date(item.enrolled_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            return `
              <tr>
                <td>
                  <span class="badge bg-light text-dark border font-monospace me-2">${escapeHtml(item.course_code)}</span>
                  <strong>${escapeHtml(item.course_name)}</strong>
                </td>
                <td><span class="category-badge">${escapeHtml(item.category)}</span></td>
                <td>${escapeHtml(item.instructor)}</td>
                <td><i class="bi bi-clock me-1 text-muted"></i>${escapeHtml(item.duration)}</td>
                <td class="text-muted small">${dateStr}</td>
                <td class="text-end">
                  <a href="course-details.html?id=${item.course_id}" class="btn btn-sm btn-outline-primary me-1" title="View Course Details">
                    <i class="bi bi-eye"></i> Details
                  </a>
                  <button class="btn btn-sm btn-outline-danger" onclick="openDropModal(${item.enrollment_id}, '${escapeJsString(item.course_name)}')" title="Drop Course">
                    <i class="bi bi-trash"></i> Drop
                  </button>
                </td>
              </tr>
            `;
          }).join('');
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      loadingPlaceholder.innerHTML = `<div class="alert alert-danger">Failed to load dashboard data.</div>`;
    }
  }

  function showDashboardAlert(message, type) {
    const container = document.getElementById('dashboardAlertContainer');
    container.innerHTML = `
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

  function escapeJsString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }
});
