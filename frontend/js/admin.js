/**
 * Admin Panel Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', async () => {
  let currentUser = null;

  // 1. Verify Admin Role
  try {
    const authRes = await fetch('/api/auth/me');
    const authData = await authRes.json();
    if (!authData.authenticated || !authData.user) {
      window.location.href = 'login.html';
      return;
    }
    if (authData.user.role !== 'admin') {
      window.location.href = 'dashboard.html';
      return;
    }
    currentUser = authData.user;
  } catch (err) {
    window.location.href = 'login.html';
    return;
  }

  let coursesList = [];
  const coursesTableBody = document.getElementById('adminCoursesTableBody');
  const loadingIndicator = document.getElementById('adminLoading');
  const alertContainer = document.getElementById('adminAlertContainer');
  const searchInput = document.getElementById('adminSearchInput');

  // Modals
  const addCourseModalEl = document.getElementById('addCourseModal');
  const addCourseModal = new bootstrap.Modal(addCourseModalEl);
  const editCourseModalEl = document.getElementById('editCourseModal');
  const editCourseModal = new bootstrap.Modal(editCourseModalEl);
  const deleteCourseModalEl = document.getElementById('deleteCourseModal');
  const deleteCourseModal = new bootstrap.Modal(deleteCourseModalEl);

  // Forms & Buttons
  const addCourseForm = document.getElementById('addCourseForm');
  const editCourseForm = document.getElementById('editCourseForm');
  const confirmDeleteBtn = document.getElementById('confirmDeleteCourseBtn');

  let courseToDeleteId = null;
  let courseToDeleteName = '';

  await loadAdminCourses();

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = coursesList.filter(c => 
        c.course_name.toLowerCase().includes(q) ||
        c.course_code.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
      renderTable(filtered);
    });
  }

  async function loadAdminCourses() {
    loadingIndicator.classList.remove('d-none');
    coursesTableBody.innerHTML = '';

    try {
      const response = await fetch('/api/courses');
      const result = await response.json();

      loadingIndicator.classList.add('d-none');

      if (response.ok && result.success) {
        coursesList = result.data;
        updateAdminStats(coursesList);
        renderTable(coursesList);
      } else {
        showAlert(result.message || 'Failed to load courses.', 'danger');
      }
    } catch (error) {
      console.error('Error fetching admin courses:', error);
      loadingIndicator.classList.add('d-none');
      showAlert('Unable to connect to server.', 'danger');
    }
  }

  function updateAdminStats(courses) {
    const totalCourses = courses.length;
    const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrolled_count || 0), 0);
    const totalCapacity = courses.reduce((acc, c) => acc + (c.capacity || 0), 0);

    document.getElementById('adminStatTotalCourses').textContent = totalCourses;
    document.getElementById('adminStatTotalEnrollments').textContent = totalEnrollments;
    document.getElementById('adminStatTotalCapacity').textContent = totalCapacity;
  }

  function renderTable(courses) {
    if (courses.length === 0) {
      coursesTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            <i class="bi bi-folder-x fs-3 d-block mb-1"></i>
            No courses found matching your criteria.
          </td>
        </tr>
      `;
      return;
    }

    coursesTableBody.innerHTML = courses.map(c => `
      <tr>
        <td class="fw-bold">${c.id}</td>
        <td><span class="badge bg-light text-dark border font-monospace">${escapeHtml(c.course_code)}</span></td>
        <td>
          <div class="fw-semibold text-dark">${escapeHtml(c.course_name)}</div>
          <div class="text-muted small">${escapeHtml(c.duration)}</div>
        </td>
        <td><span class="category-badge">${escapeHtml(c.category)}</span></td>
        <td>${escapeHtml(c.instructor)}</td>
        <td>${c.capacity}</td>
        <td>
          <span class="badge ${c.enrolled_count >= c.capacity ? 'bg-danger' : 'bg-primary'}">
            ${c.enrolled_count} / ${c.capacity}
          </span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${c.id})" title="Edit Course">
            <i class="bi bi-pencil-square"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal(${c.id}, '${escapeJsString(c.course_name)}', ${c.enrolled_count})" title="Delete Course">
            <i class="bi bi-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  // --- Add Course Submission ---
  addCourseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveCourseBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving...`;

    const newCourse = {
      course_name: document.getElementById('addCourseName').value.trim(),
      course_code: document.getElementById('addCourseCode').value.trim(),
      instructor: document.getElementById('addInstructor').value.trim(),
      category: document.getElementById('addCategory').value.trim(),
      duration: document.getElementById('addDuration').value.trim(),
      description: document.getElementById('addDescription').value.trim(),
      capacity: parseInt(document.getElementById('addCapacity').value, 10)
    };

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        addCourseModal.hide();
        addCourseForm.reset();
        showAlert(`Course "${newCourse.course_name}" created successfully!`, 'success');
        await loadAdminCourses();
      } else {
        alert(result.message || 'Failed to add course.');
      }
    } catch (err) {
      console.error('Error adding course:', err);
      alert('Error creating course.');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i class="bi bi-check-lg me-1"></i>Create Course`;
    }
  });

  // --- Edit Course Setup & Submission ---
  window.openEditModal = function(id) {
    const course = coursesList.find(c => c.id === id);
    if (!course) return;

    document.getElementById('editCourseId').value = course.id;
    document.getElementById('editCourseName').value = course.course_name;
    document.getElementById('editCourseCode').value = course.course_code;
    document.getElementById('editInstructor').value = course.instructor;
    document.getElementById('editCategory').value = course.category;
    document.getElementById('editDuration').value = course.duration;
    document.getElementById('editCapacity').value = course.capacity;
    document.getElementById('editDescription').value = course.description;

    editCourseModal.show();
  };

  editCourseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updateBtn = document.getElementById('updateCourseBtn');
    updateBtn.disabled = true;
    updateBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Updating...`;

    const id = document.getElementById('editCourseId').value;
    const updatedData = {
      course_name: document.getElementById('editCourseName').value.trim(),
      course_code: document.getElementById('editCourseCode').value.trim(),
      instructor: document.getElementById('editInstructor').value.trim(),
      category: document.getElementById('editCategory').value.trim(),
      duration: document.getElementById('editDuration').value.trim(),
      description: document.getElementById('editDescription').value.trim(),
      capacity: parseInt(document.getElementById('editCapacity').value, 10)
    };

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        editCourseModal.hide();
        showAlert(`Course "${updatedData.course_name}" updated successfully!`, 'success');
        await loadAdminCourses();
      } else {
        alert(result.message || 'Failed to update course.');
      }
    } catch (err) {
      console.error('Error updating course:', err);
      alert('Error saving updates.');
    } finally {
      updateBtn.disabled = false;
      updateBtn.innerHTML = `<i class="bi bi-save me-1"></i>Save Changes`;
    }
  });

  // --- Delete Course Setup & Submission ---
  window.openDeleteModal = function(id, name, enrolledCount) {
    courseToDeleteId = id;
    courseToDeleteName = name;
    document.getElementById('deleteCourseNameSpan').textContent = name;
    
    const warnEl = document.getElementById('deleteEnrollmentWarning');
    if (enrolledCount > 0) {
      warnEl.textContent = `Warning: ${enrolledCount} active student enrollment(s) will also be removed.`;
      warnEl.classList.remove('d-none');
    } else {
      warnEl.classList.add('d-none');
    }

    deleteCourseModal.show();
  };

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!courseToDeleteId) return;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Deleting...`;

    try {
      const response = await fetch(`/api/courses/${courseToDeleteId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      deleteCourseModal.hide();

      if (response.ok && result.success) {
        showAlert(`Course "${courseToDeleteName}" deleted successfully!`, 'success');
        await loadAdminCourses();
      } else {
        showAlert(result.message || 'Failed to delete course.', 'danger');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      showAlert('Error deleting course.', 'danger');
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.innerHTML = `<i class="bi bi-trash me-1"></i>Yes, Delete Course`;
      courseToDeleteId = null;
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

  function escapeJsString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }
});
