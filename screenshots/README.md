# Application Screenshots

**Project Title:** Online Student Course Management System  
**Candidate Name:** Angelin Sarah George  
**Domain:** Full Stack Web Development  
**Repository:** https://github.com/angelin-08/Student-Course-Management  

This directory contains visual documentation of the working web application across student and administrative workflows.

---

## Screenshot Inventory & Descriptions

| # | Filename | View / Workflow | Description |
|---|---|---|---|
| 01 | `01_home_page.png` | Home Landing Page | Public home page showing hero banner, platform value propositions, and featured courses. |
| 02 | `02_registration.png` | Student Registration | Account creation form with full name, email, password validation, and error alert handling. |
| 03 | `03_login.png` | User Login | Authentication page for students and administrators with form validation. |
| 04 | `04_student_dashboard.png` | Student Dashboard | Metric cards (Total Courses, Enrolled Courses, Available to Enroll) and recent enrollments table. |
| 05 | `05_course_catalog.png` | Course Catalog | Course browsing grid with seat progress indicators, category badges, and duration info. |
| 06 | `06_course_details.png` | Course Details & Enrollment | Single course overview displaying syllabus description, instructor details, and "Enroll Now" action. |
| 07 | `07_course_catalog_enrolled_state.png` | Enrolled State in Catalog | Course catalog card highlighting the green "Enrolled" badge for active student registrations. |
| 08 | `08_my_courses.png` | My Enrolled Courses | Student's active course roster with registration dates and the "Drop Course" option. |
| 09 | `09_course_category_filter.png` | Category Filtering | Course catalog filtered by specific category pills (e.g. "Artificial Intelligence", "Web Development"). |
| 10 | `10_course_search.png` | Keyword Search | Live course catalog search results filtered by title, code, or instructor name. |
| 11 | `11_admin_dashboard.png` | Admin Management Panel | Administrator control panel with metric overview and complete course catalog table. |
| 12 | `12_admin_edit_course.png` | Admin Edit Course Modal | Modal dialog pre-filled with existing course data to update title, instructor, duration, or capacity. |
| 13 | `13_admin_add_course.png` | Admin Add Course Modal | Modal dialog with validation to add a new course with custom code, category, and capacity. |
| 14 | `14_admin_delete_course.png` | Admin Delete Confirmation | Confirmation dialog with active student enrollment impact warning before deletion. |

---

## Manual Capture Instructions

To capture authentic screenshots from the running application:

1. **Start the local server:**
   ```bash
   npm start
   ```
2. **Access the application in your web browser:**
   ```
   http://localhost:5000
   ```
3. **Capture Guest & Public Views:**
   - Navigate to `http://localhost:5000/index.html` -> Capture `01_home_page.png`
   - Navigate to `http://localhost:5000/register.html` -> Capture `02_registration.png`
   - Navigate to `http://localhost:5000/login.html` -> Capture `03_login.png`
   - Navigate to `http://localhost:5000/courses.html` -> Capture `05_course_catalog.png`
   - Click "Filter by Category" -> Capture `09_course_category_filter.png`
   - Type a query into the Search bar -> Capture `10_course_search.png`
   - Click "View Details" on any course -> Capture `06_course_details.png`

4. **Capture Student Workflow Views:**
   - Log in using `student@courseportal.com` / `Student@123`
   - Navigate to `http://localhost:5000/dashboard.html` -> Capture `04_student_dashboard.png`
   - Browse catalog with enrolled status visible -> Capture `07_course_catalog_enrolled_state.png`
   - Navigate to `http://localhost:5000/my-courses.html` -> Capture `08_my_courses.png`

5. **Capture Administrator Workflow Views:**
   - Log out and log in using `admin@courseportal.com` / `Admin@123`
   - Navigate to `http://localhost:5000/admin.html` -> Capture `11_admin_dashboard.png`
   - Click "Add New Course" button to open modal -> Capture `13_admin_add_course.png`
   - Click "Edit" on a course row -> Capture `12_admin_edit_course.png`
   - Click "Delete" on a course row -> Capture `14_admin_delete_course.png`

Save the PNG files in this `screenshots/` directory.
