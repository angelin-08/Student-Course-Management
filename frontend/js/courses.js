/**
 * Course Catalog Handler
 * Online Student Course Management System
 */

document.addEventListener('DOMContentLoaded', async () => {
  let allCourses = [];
  let currentCategory = 'All';
  let searchQuery = '';

  const coursesGrid = document.getElementById('coursesGrid');
  const loadingIndicator = document.getElementById('coursesLoading');
  const noCoursesFound = document.getElementById('noCoursesFound');
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  const categoryFiltersContainer = document.getElementById('categoryFilters');
  const activeFilterLabel = document.getElementById('activeFilterLabel');

  // Initial fetch
  await fetchCourses();

  // Search form submit
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchQuery = searchInput.value.trim();
      fetchCourses();
    });
  }

  // Live search debounce
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        fetchCourses();
      }, 300);
    });
  }

  async function fetchCourses() {
    loadingIndicator.classList.remove('d-none');
    noCoursesFound.classList.add('d-none');
    coursesGrid.innerHTML = '';

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (currentCategory && currentCategory !== 'All') params.append('category', currentCategory);

      const url = `/api/courses?${params.toString()}`;
      const response = await fetch(url);
      const result = await response.json();

      loadingIndicator.classList.add('d-none');

      if (response.ok && result.success) {
        allCourses = result.data;
        renderCategoryPills(allCourses);
        renderCourses(allCourses);
      } else {
        coursesGrid.innerHTML = `<div class="col-12"><div class="alert alert-danger">${escapeHtml(result.message || 'Failed to load courses.')}</div></div>`;
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      loadingIndicator.classList.add('d-none');
      coursesGrid.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error loading courses from server.</div></div>`;
    }
  }

  function renderCategoryPills(courses) {
    if (!categoryFiltersContainer) return;

    // Collect unique categories
    const categories = ['All'];
    courses.forEach(c => {
      if (c.category && !categories.includes(c.category)) {
        categories.push(c.category);
      }
    });

    categoryFiltersContainer.innerHTML = categories.map(cat => {
      const isActive = (cat === currentCategory) ? 'active' : '';
      return `
        <button class="filter-pill ${isActive}" data-category="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `;
    }).join('');

    // Attach click events
    categoryFiltersContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-category');
        categoryFiltersContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (activeFilterLabel) {
          activeFilterLabel.textContent = currentCategory === 'All' ? 'All Courses' : `Category: ${currentCategory}`;
        }
        fetchCourses();
      });
    });
  }

  function renderCourses(courses) {
    if (courses.length === 0) {
      noCoursesFound.classList.remove('d-none');
      return;
    }

    noCoursesFound.classList.add('d-none');

    coursesGrid.innerHTML = courses.map(course => {
      const percentFull = Math.min(100, Math.round((course.enrolled_count / course.capacity) * 100));
      
      let statusBadge = '';
      if (course.is_enrolled) {
        statusBadge = `<span class="status-badge-enrolled"><i class="bi bi-check-circle-fill me-1"></i>Enrolled</span>`;
      } else if (course.available_seats === 0) {
        statusBadge = `<span class="status-badge-full"><i class="bi bi-slash-circle-fill me-1"></i>Course Full</span>`;
      } else {
        statusBadge = `<span class="status-badge-available"><i class="bi bi-person-check-fill me-1"></i>${course.available_seats} Seats Left</span>`;
      }

      let progressColor = 'bg-primary';
      if (percentFull >= 90) progressColor = 'bg-danger';
      else if (percentFull >= 70) progressColor = 'bg-warning';

      return `
        <div class="col-md-6 col-lg-4">
          <div class="card custom-card h-100 d-flex flex-column">
            <div class="card-body d-flex flex-column p-4">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="category-badge">${escapeHtml(course.category)}</span>
                ${statusBadge}
              </div>

              <div class="small text-muted font-monospace mb-1">${escapeHtml(course.course_code)}</div>
              <h5 class="card-title mb-2 text-dark">${escapeHtml(course.course_name)}</h5>
              
              <p class="card-text text-muted small flex-grow-1 mb-3">
                ${escapeHtml(course.description.length > 110 ? course.description.substring(0, 110) + '...' : course.description)}
              </p>

              <div class="border-top pt-3 mt-auto">
                <div class="d-flex justify-content-between text-muted small mb-2">
                  <span><i class="bi bi-person-fill me-1 text-primary"></i>${escapeHtml(course.instructor)}</span>
                  <span><i class="bi bi-clock-history me-1 text-primary"></i>${escapeHtml(course.duration)}</span>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between small text-muted mb-1">
                    <span>Capacity: ${course.enrolled_count}/${course.capacity}</span>
                    <span>${percentFull}% filled</span>
                  </div>
                  <div class="seat-progress-bar">
                    <div class="seat-progress-fill ${progressColor}" style="width: ${percentFull}%"></div>
                  </div>
                </div>

                <a href="course-details.html?id=${course.id}" class="btn btn-outline-primary w-100">
                  <i class="bi bi-info-circle me-1"></i>View Details
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
