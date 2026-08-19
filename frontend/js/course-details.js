/**
 * Course Details & Enrollment Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const contentContainer = document.getElementById('courseDetailsContent');
  const loadingIndicator = document.getElementById('detailsLoading');
  const alertContainer = document.getElementById('detailsAlertContainer');

  if (!courseId) {
    loadingIndicator.classList.add('d-none');
    alertContainer.innerHTML = `
      <div class="alert alert-warning">
        No course ID was specified. <a href="courses.html" class="alert-link">Browse available courses</a>.
      </div>
    `;
    return;
  }

  let currentUser = null;
  try {
    const authRes = await fetch('/api/auth/me');
    const authData = await authRes.json();
    if (authData.authenticated && authData.user) {
      currentUser = authData.user;
    }
  } catch (err) {
    console.error('Error checking auth in course details:', err);
  }

  await loadCourseDetails();

  async function loadCourseDetails() {
    loadingIndicator.classList.remove('d-none');
    contentContainer.classList.add('d-none');

    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const result = await response.json();

      loadingIndicator.classList.add('d-none');

      if (!response.ok || !result.success) {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            ${escapeHtml(result.message || 'Course not found.')} <a href="courses.html" class="alert-link">Return to catalog</a>.
          </div>
        `;
        return;
      }

      const course = result.data;
      renderCourseDetails(course);
      contentContainer.classList.remove('d-none');

    } catch (error) {
      console.error('Error loading course details:', error);
      loadingIndicator.classList.add('d-none');
      alertContainer.innerHTML = `<div class="alert alert-danger">Failed to retrieve course details from server.</div>`;
    }
  }

  function renderCourseDetails(course) {
    document.getElementById('courseTitleHeader').textContent = course.course_name;
    document.getElementById('courseCodeBadge').textContent = course.course_code;
    document.getElementById('courseCategoryBadge').textContent = course.category;
    document.getElementById('courseInstructorSpan').textContent = course.instructor;
    document.getElementById('courseDurationSpan').textContent = course.duration;
    document.getElementById('courseDescriptionP').textContent = course.description;
    document.getElementById('courseCapacitySpan').textContent = course.capacity;
    document.getElementById('courseEnrolledSpan').textContent = course.enrolled_count;
    document.getElementById('courseAvailableSpan').textContent = course.available_seats;

    const percentFull = Math.min(100, Math.round((course.enrolled_count / course.capacity) * 100));
    const progressBar = document.getElementById('courseProgressBar');
    progressBar.style.width = `${percentFull}%`;
    progressBar.className = `progress-bar ${percentFull >= 90 ? 'bg-danger' : percentFull >= 70 ? 'bg-warning' : 'bg-primary'}`;
    document.getElementById('coursePercentSpan').textContent = `${percentFull}% Filled`;

    // Action button area
    const actionContainer = document.getElementById('enrollmentActionArea');

    if (!currentUser) {
      // Guest
      actionContainer.innerHTML = `
        <div class="card p-3 bg-light border">
          <p class="text-muted small mb-2"><i class="bi bi-info-circle me-1"></i>Please log in as a student to enroll in this course.</p>
          <a href="login.html" class="btn btn-primary">
            <i class="bi bi-box-arrow-in-right me-1"></i>Log In to Enroll
          </a>
        </div>
      `;
    } else if (currentUser.role === 'admin') {
      // Admin
      actionContainer.innerHTML = `
        <div class="card p-3 bg-light border">
          <p class="text-muted small mb-2"><i class="bi bi-shield-check me-1"></i>You are logged in as an Administrator.</p>
          <a href="admin.html" class="btn btn-dark">
            <i class="bi bi-gear-fill me-1"></i>Manage in Admin Panel
          </a>
        </div>
      `;
    } else if (course.is_enrolled) {
      // Student already enrolled
      actionContainer.innerHTML = `
        <div class="card p-3 border-success bg-light">
          <div class="d-flex align-items-center text-success mb-2">
            <i class="bi bi-check-circle-fill fs-4 me-2"></i>
            <span class="fw-semibold">You are actively enrolled in this course!</span>
          </div>
          <a href="my-courses.html" class="btn btn-outline-success">
            <i class="bi bi-collection-play me-1"></i>View in My Courses
          </a>
        </div>
      `;
    } else if (course.available_seats <= 0) {
      // Course Full
      actionContainer.innerHTML = `
        <div class="card p-3 border-danger bg-light">
          <div class="d-flex align-items-center text-danger mb-2">
            <i class="bi bi-x-circle-fill fs-4 me-2"></i>
            <span class="fw-semibold">This course is currently at full capacity.</span>
          </div>
          <button class="btn btn-secondary" disabled>
            <i class="bi bi-slash-circle me-1"></i>Course Full
          </button>
        </div>
      `;
    } else {
      // Student can enroll
      actionContainer.innerHTML = `
        <div class="card p-3 border-primary bg-light">
          <p class="text-muted small mb-2"><i class="bi bi-person-check me-1"></i>${course.available_seats} seats remaining. Enroll now to secure your spot.</p>
          <button id="enrollNowBtn" class="btn btn-primary btn-lg" onclick="handleEnrollment(${course.id})">
            <i class="bi bi-plus-circle me-1"></i>Enroll in this Course
          </button>
        </div>
      `;
    }
  }

  window.handleEnrollment = async function(cId) {
    const enrollBtn = document.getElementById('enrollNowBtn');
    if (enrollBtn) {
      enrollBtn.disabled = true;
      enrollBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Enrolling...`;
    }

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: cId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showDetailsAlert(result.message || 'Successfully enrolled!', 'success');
        await loadCourseDetails();
      } else {
        showDetailsAlert(result.message || 'Failed to enroll in course.', 'danger');
        if (enrollBtn) {
          enrollBtn.disabled = false;
          enrollBtn.innerHTML = `<i class="bi bi-plus-circle me-1"></i>Enroll in this Course`;
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      showDetailsAlert('Unable to process enrollment request.', 'danger');
      if (enrollBtn) {
        enrollBtn.disabled = false;
        enrollBtn.innerHTML = `<i class="bi bi-plus-circle me-1"></i>Enroll in this Course`;
      }
    }
  };

  function showDetailsAlert(message, type) {
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
