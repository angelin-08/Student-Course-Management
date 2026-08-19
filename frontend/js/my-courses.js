/**
 * My Enrolled Courses Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', async () => {
  let currentUser = null;

  try {
    const authRes = await fetch('/api/auth/me');
    const authData = await authRes.json();
    if (!authData.authenticated || !authData.user) {
      window.location.href = 'login.html';
      return;
    }
    if (authData.user.role === 'admin') {
      window.location.href = 'admin.html';
      return;
    }
    currentUser = authData.user;
  } catch (err) {
    window.location.href = 'login.html';
    return;
  }

  const coursesListContainer = document.getElementById('myCoursesList');
  const loadingIndicator = document.getElementById('myCoursesLoading');
  const emptyState = document.getElementById('emptyCoursesState');
  const alertContainer = document.getElementById('myCoursesAlertContainer');
  const enrolledCountBadge = document.getElementById('enrolledCountBadge');

  let selectedEnrollmentId = null;
  let selectedCourseName = '';

  await loadMyCourses();

  // Drop Modal setup
  const confirmDropBtn = document.getElementById('confirmDropBtn');
  
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
        showAlert(`Successfully dropped "${selectedCourseName}".`, 'success');
        await loadMyCourses();
      } else {
        showAlert(result.message || 'Failed to drop course.', 'danger');
      }
    } catch (error) {
      console.error('Error dropping course:', error);
      showAlert('Error connecting to the server.', 'danger');
    } finally {
      confirmDropBtn.disabled = false;
      confirmDropBtn.innerHTML = 'Yes, Drop Course';
      selectedEnrollmentId = null;
    }
  });

  async function loadMyCourses() {
    loadingIndicator.classList.remove('d-none');
    emptyState.classList.add('d-none');
    coursesListContainer.innerHTML = '';

    try {
      const response = await fetch('/api/enrollments/my-courses');
      const result = await response.json();

      loadingIndicator.classList.add('d-none');

      if (response.ok && result.success) {
        const courses = result.data;
        if (enrolledCountBadge) {
          enrolledCountBadge.textContent = `${courses.length} Course${courses.length === 1 ? '' : 's'}`;
        }

        if (courses.length === 0) {
          emptyState.classList.remove('d-none');
          return;
        }

        coursesListContainer.innerHTML = courses.map(item => {
          const dateStr = new Date(item.enrolled_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });

          return `
            <div class="card custom-card mb-3 p-4">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="badge bg-light text-dark border font-monospace">${escapeHtml(item.course_code)}</span>
                    <span class="category-badge">${escapeHtml(item.category)}</span>
                    <span class="status-badge-enrolled"><i class="bi bi-check-circle-fill me-1"></i>Enrolled</span>
                  </div>
                  <h4 class="card-title mb-2 text-dark">${escapeHtml(item.course_name)}</h4>
                  <p class="text-muted small mb-2">${escapeHtml(item.description)}</p>
                  <div class="d-flex flex-wrap gap-3 text-muted small">
                    <span><i class="bi bi-person-fill text-primary me-1"></i>${escapeHtml(item.instructor)}</span>
                    <span><i class="bi bi-clock text-primary me-1"></i>${escapeHtml(item.duration)}</span>
                    <span><i class="bi bi-calendar-check text-primary me-1"></i>Enrolled on ${dateStr}</span>
                  </div>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0 d-flex flex-md-column gap-2 justify-content-end">
                  <a href="course-details.html?id=${item.course_id}" class="btn btn-outline-primary">
                    <i class="bi bi-info-circle me-1"></i>Course Details
                  </a>
                  <button class="btn btn-outline-danger" onclick="openDropModal(${item.enrollment_id}, '${escapeJsString(item.course_name)}')">
                    <i class="bi bi-trash me-1"></i>Drop Course
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        showAlert(result.message || 'Failed to fetch enrolled courses.', 'danger');
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      loadingIndicator.classList.add('d-none');
      showAlert('Unable to load your courses from the server.', 'danger');
    }
  }

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

  function escapeJsString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }
});
