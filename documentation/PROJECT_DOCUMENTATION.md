# Project Documentation - Online Student Course Management System

---

## 1. Project Title
**Online Student Course Management System**

## 2. Candidate Name
**Angelin Sarah George**

## 3. Domain
**Full Stack Web Development**

## 4. GitHub Repository
**https://github.com/angelin-08/Student-Course-Management**

---

## 5. Introduction
The **Online Student Course Management System** is a lightweight, responsive, and robust web application designed to simplify academic course registration, curriculum management, and capacity tracking. Built using modern web standards (Node.js, Express.js, MySQL, Bootstrap 5, and Vanilla JavaScript), the platform addresses the needs of both students looking for flexible course enrollment and administrators requiring real-time curriculum oversight.

---

## 5. Problem Statement
Traditional and manual course enrollment processes in educational institutions often suffer from several recurring challenges:
- **Inefficient Seat Tracking:** Students encounter scheduling conflicts and over-enrollment when seat capacities are not tracked atomically in real time.
- **Fragmented Portals:** Disconnected interfaces make it difficult for students to monitor their active registrations or explore multidisciplinary electives.
- **Administrative Overhead:** Course managers frequently lack an integrated tool to create new course offerings, update descriptions, adjust seat capacities, and view enrollment statistics.
- **Security Vulnerabilities:** Inadequate authorization checks allow unauthorized role escalation or unauthenticated access to student rosters.

---

## 6. Proposed Solution
The proposed web application delivers a unified, session-authenticated platform that provides:
- **Real-Time Seat & Capacity Calculations:** Automatic seat deduction upon enrollment and seat release upon course drop.
- **Role-Based Authorization:** Clear distinction between Student and Administrator roles enforced both on the client UI and the Express backend middleware.
- **Streamlined User Experience:** Clean, responsive Bootstrap 5 interface facilitating quick search, category filtering, one-click enrollment, and drop actions with modal confirmations.
- **Robust Relational Data Integrity:** MySQL database with foreign key cascades, unique constraints, and bcrypt password hashing.

---

## 7. Objectives
1. Develop an accessible web interface using HTML5, CSS3, Bootstrap 5, and Vanilla JavaScript.
2. Build an Express.js REST API with session-based authentication (`express-session`) and bcrypt cryptographic hashing.
3. Model a normalized MySQL relational database (`users`, `courses`, `enrollments`) with cascade constraints.
4. Provide students with self-service registration, course discovery with live search/filters, enrollment, and dashboard metrics.
5. Provide administrators with full CRUD capabilities over the academic course catalog.
6. Verify API reliability and security through an automated integration test suite.

---

## 8. Technology Stack

### Frontend Layer
- **HTML5 & CSS3:** Semantic markup and custom styling with CSS custom properties.
- **Bootstrap 5 (v5.3.3):** Responsive grid layout, modals, dropdowns, navigation bar, and form controls.
- **Bootstrap Icons (v1.11.3):** Vector iconography for visual clarity and accessibility.
- **Vanilla JavaScript (ES6+):** Asynchronous DOM manipulation, Fetch API calls, and client-side form validation without external UI frameworks.

### Backend Layer
- **Node.js (v22+):** Asynchronous JavaScript runtime environment.
- **Express.js (v4.19):** Web application framework handling routing, static asset serving, and middleware pipelines.
- **express-session:** Server-side session management with signed HTTP cookies.
- **bcrypt (v5.1):** Password hashing with salt rounds for secure credential storage.
- **cors & dotenv:** Cross-Origin Resource Sharing and environment variable isolation.

### Database Layer
- **MySQL Server (v8+ / 26.7):** Relational database management system.
- **mysql2/promise:** High-performance MySQL client supporting prepared statements and connection pooling.

---

## 9. System Architecture
The application employs a 3-tier client-server architecture:

```
+-------------------------------------------------------------+
|                      Client Tier                            |
|  - HTML5 / CSS3 / Bootstrap 5 / Vanilla JavaScript          |
|  - Dynamic Nav, Catalog Search, Modals, Session Fetch API   |
+------------------------------+------------------------------+
                               |
                        HTTP / REST (JSON)
                               |
+------------------------------v------------------------------+
|                     Application Tier                        |
|  - Node.js & Express.js Server                              |
|  - Authentication Middleware (requireLogin, requireAdmin)   |
|  - RESTful Route Controllers (/api/auth, /api/courses, ...) |
|  - Centralized Sanitized Error Handling                     |
+------------------------------+------------------------------+
                               |
                     Connection Pool (SQL)
                               |
+------------------------------v------------------------------+
|                      Database Tier                          |
|  - MySQL Server (student_course_management)                 |
|  - Tables: users, courses, enrollments                      |
|  - Foreign Key Constraints & Cascade Operations             |
+-------------------------------------------------------------+
```

---

## 10. Database Design
The relational schema is structured around three primary entities: `users`, `courses`, and `enrollments`. Referential integrity is enforced using foreign keys with `ON DELETE CASCADE` and `ON UPDATE CASCADE`.

### Entity-Relationship Structure
- **Users to Enrollments:** One-to-Many (`users.id` -> `enrollments.student_id`).
- **Courses to Enrollments:** One-to-Many (`courses.id` -> `enrollments.course_id`).
- **Unique Constraint:** `UNIQUE(student_id, course_id)` prevents accidental duplicate enrollments.

---

## 11. Database Tables

### 1. `users` Table
Stores registered student accounts and system administrators.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique user identifier |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Full name of the user |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | Login email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | Bcrypt password hash |
| `role` | `ENUM('student', 'admin')` | `NOT NULL DEFAULT 'student'` | Access role |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |

### 2. `courses` Table
Maintains academic curriculum offerings and class capacities.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique course identifier |
| `course_name` | `VARCHAR(150)` | `NOT NULL` | Descriptive course title |
| `course_code` | `VARCHAR(50)` | `NOT NULL UNIQUE` | Academic course code (e.g. `WD-110`) |
| `instructor` | `VARCHAR(100)` | `NOT NULL` | Name of lead instructor |
| `category` | `VARCHAR(100)` | `NOT NULL` | Department/category classification |
| `duration` | `VARCHAR(50)` | `NOT NULL` | Course duration (e.g. `12 Weeks`) |
| `description` | `TEXT` | `NOT NULL` | Syllabus summary & overview |
| `capacity` | `INT` | `NOT NULL DEFAULT 30` | Maximum student capacity |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP`| Last update timestamp |

### 3. `enrollments` Table
Tracks student registrations and enrollment statuses.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | `AUTO_INCREMENT PRIMARY KEY` | Unique enrollment record ID |
| `student_id` | `INT` | `NOT NULL, FK -> users(id)` | Enrolled student ID |
| `course_id` | `INT` | `NOT NULL, FK -> courses(id)` | Selected course ID |
| `enrolled_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Enrollment timestamp |
| `status` | `ENUM('enrolled','completed','dropped')` | `DEFAULT 'enrolled'` | Current enrollment status |

---

## 12. Application Modules
The system is divided into five core functional modules:
1. **Authentication & Authorization Module:** Account registration, login verification, session persistence, and role guards.
2. **Course Catalog & Discovery Module:** Public browsing, live search, category filtering, and capacity calculation.
3. **Course Details & Enrollment Module:** In-depth syllabus inspection, seat tracking, and enrollment actions.
4. **Student Dashboard & Roster Module:** Summary metrics, active enrollment records, and course drop actions.
5. **Administrative Management Module:** Complete course CRUD management, capacity adjustments, and active enrollment safety checks.

---

## 13. Authentication
- **Password Security:** User passwords are encrypted with bcrypt using 10 salt rounds before database persistence.
- **Session Management:** Sessions are stored via `express-session` with `httpOnly: true` cookies, preventing cross-site scripting (XSS) cookie theft.
- **Server-Side Role Verification:** Middleware guards (`requireLogin`, `requireAdmin`, `requireStudent`) evaluate session state on every incoming API request.

---

## 14. Course Management
Administrators can manage the curriculum catalog directly from the Admin Panel:
- **Add Course:** Form validation ensures unique course codes and positive integer capacities.
- **Edit Course:** Allows modification of title, instructor, duration, category, and capacity while enforcing uniqueness on course codes.
- **Delete Course:** Cascading foreign keys automatically clean up dependent enrollment records upon deletion.

---

## 15. Enrollment
The enrollment engine enforces strict integrity rules:
1. **Authentication Check:** The user must possess an active `student` session.
2. **Existence Check:** The target course must exist in the database.
3. **Duplicate Prevention:** Query checks if the student already holds an active enrollment in the target course.
4. **Capacity Enforcement:** Active enrollment count is compared against total capacity (`active_count < capacity`). If full, registration is rejected with an informative message.
5. **Seat Release:** When a student drops a course, the enrollment record is deleted, making the seat instantly available to other students.

---

## 16. Student Dashboard
The Student Dashboard (`dashboard.html`) provides students with a high-level view of their academic workload:
- **Key Metrics:** Real-time counters for Total Catalog Courses, My Enrolled Courses, and Courses Available for Enrollment.
- **Recent Registrations:** Table of recent enrollments with quick links to course details and drop modals.

---

## 17. Admin Panel
The Admin Panel (`admin.html`) provides administrators with complete control:
- **System Overview:** Total Courses, Total Student Enrollments, and Aggregate Seat Capacity.
- **Live Search Table:** Rapidly locate courses by code, title, category, or instructor.
- **Interactive Modals:** Bootstrap modals for adding, editing, and deleting courses with safety warnings.

---

## 18. API Overview
All endpoints follow RESTful conventions and return standardized JSON responses:

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/health` | GET | Public | System and MySQL database connectivity check |
| `/api/auth/register` | POST | Public | Register new student account |
| `/api/auth/login` | POST | Public | Authenticate user credentials and create session |
| `/api/auth/logout` | POST | Any | Invalidate session and clear cookie |
| `/api/auth/me` | GET | Public | Retrieve active session user information |
| `/api/courses` | GET | Public | List courses with search, filters, and seat availability |
| `/api/courses/:id` | GET | Public | Retrieve single course details and enrollment status |
| `/api/courses` | POST | Admin | Create a new course offering |
| `/api/courses/:id` | PUT | Admin | Update course metadata and capacity |
| `/api/courses/:id` | DELETE | Admin | Delete course offering |
| `/api/enrollments` | POST | Student | Enroll logged-in student in a course |
| `/api/enrollments/my-courses` | GET | Student | Get all enrolled courses for logged-in student |
| `/api/enrollments/:id` | DELETE | Student | Drop an enrolled course |
| `/api/enrollments/dashboard-stats` | GET | Student | Aggregate student dashboard metrics |

---

## 19. Testing and Verification
The system was validated using an automated integration test suite (`backend/scripts/test-endpoints.js`) running against the live MySQL server instance (`localhost:3306`).

### Test Execution Summary
- **Total Tests Executed:** 22
- **Passed Tests:** 22
- **Failed Tests:** 0
- **Success Rate:** 100.0%

### Validated Test Scenarios
1. Health check verification (`GET /api/health`).
2. Student registration with session creation (`POST /api/auth/register`).
3. Prevention of duplicate email registration (`POST /api/auth/register` -> 409 Conflict).
4. Student authentication (`POST /api/auth/login`).
5. Current user retrieval (`GET /api/auth/me`).
6. Course listing and seat calculation (`GET /api/courses`).
7. Keyword course search (`GET /api/courses?search=Web`).
8. Category filtering (`GET /api/courses?category=Artificial+Intelligence`).
9. Single course details retrieval (`GET /api/courses/:id`).
10. Student course enrollment (`POST /api/enrollments`).
11. Duplicate enrollment prevention (`POST /api/enrollments` -> 400 Bad Request).
12. Enrolled courses retrieval (`GET /api/enrollments/my-courses`).
13. Dashboard statistics aggregation (`GET /api/enrollments/dashboard-stats`).
14. Course drop execution (`DELETE /api/enrollments/:id`).
15. Student blocked from administrative actions (`POST /api/courses` -> 403 Forbidden).
16. Administrator authentication (`POST /api/auth/login` as admin).
17. Course creation by administrator (`POST /api/courses` -> 201 Created).
18. Course update by administrator (`PUT /api/courses/:id` -> 200 OK).
19. Course deletion by administrator (`DELETE /api/courses/:id` -> 200 OK).
20. User logout session destruction (`POST /api/auth/logout`).
21. Protection of private endpoints after logout (`GET /api/enrollments/my-courses` -> 401 Unauthorized).
22. Fallback handling for non-existent routes (`GET /api/invalid-route` -> 404 Not Found).

---

## 20. Application Screenshots
A checklist of the 14 standard application screenshots is maintained in `screenshots/README.md`:
1. `01_home_page.png` - Home Landing Page
2. `02_registration.png` - Student Registration
3. `03_login.png` - User Login Page
4. `04_student_dashboard.png` - Student Dashboard
5. `05_course_catalog.png` - Course Catalog Grid
6. `06_course_details.png` - Course Details & Enrollment
7. `07_course_catalog_enrolled_state.png` - Catalog with Enrolled State
8. `08_my_courses.png` - My Enrolled Courses
9. `09_course_category_filter.png` - Category Filtering View
10. `10_course_search.png` - Keyword Search View
11. `11_admin_dashboard.png` - Admin Management Panel
12. `12_admin_edit_course.png` - Admin Edit Course Modal
13. `13_admin_add_course.png` - Admin Add Course Modal
14. `14_admin_delete_course.png` - Admin Delete Course Modal

---

## 21. Limitations
- **File Uploads:** Course materials (syllabi PDFs, lecture notes) are represented as text descriptions rather than uploaded binary files.
- **Payment Gateway:** The system focuses on academic enrollment workflows without fee transaction processing.
- **Grade Management:** The scope centers on course registration and capacity management without gradebook functionality.

---

## 22. Future Enhancements
- **Course Prerequisites:** Add prerequisites logic to require completion of introductory courses before enrolling in advanced ones.
- **Waitlisting:** Enable automatic waitlisting when courses reach full capacity, notifying students as seats become available.
- **Email Notifications:** Integrate automated transactional emails upon registration and enrollment confirmation.
- **Analytics & Export:** Provide administrators with downloadable CSV/PDF reports of student rosters and department enrollment trends.

---

## 23. Conclusion
The **Online Student Course Management System** successfully fulfills all minor internship project requirements. By combining a modern, accessible Bootstrap 5 frontend with a secure Express.js REST API and a normalized MySQL database, the platform provides a reliable, responsive, and maintainable solution for academic course registration and administration.
