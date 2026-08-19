# API Documentation - Online Student Course Management System

**Project Title:** Online Student Course Management System  
**Candidate Name:** Angelin Sarah George  
**Domain:** Full Stack Web Development  
**GitHub Repository:** https://github.com/angelin-08/Student-Course-Management  
**Base URL:** `http://localhost:5000/api`  
**Authentication Strategy:** Session-based cookies (`express-session` with `connect.sid`)  

---

## Table of Contents
1. [System Health](#1-system-health)
2. [Authentication Endpoints](#2-authentication-endpoints)
   - [POST /api/auth/register](#post-apiauthregister)
   - [POST /api/auth/login](#post-apiauthlogin)
   - [POST /api/auth/logout](#post-apiauthlogout)
   - [GET /api/auth/me](#get-apiauthme)
3. [Course Management Endpoints](#3-course-management-endpoints)
   - [GET /api/courses](#get-apicourses)
   - [GET /api/courses/:id](#get-apicoursesid)
   - [POST /api/courses](#post-apicourses)
   - [PUT /api/courses/:id](#put-apicoursesid)
   - [DELETE /api/courses/:id](#delete-apicoursesid)
4. [Enrollment Endpoints](#4-enrollment-endpoints)
   - [POST /api/enrollments](#post-apienrollments)
   - [GET /api/enrollments/my-courses](#get-apienrollmentsmy-courses)
   - [DELETE /api/enrollments/:id](#delete-apienrollmentsid)
   - [GET /api/enrollments/dashboard-stats](#get-apienrollmentsdashboard-stats)

---

## 1. System Health

### `GET /api/health`
- **Purpose:** Verifies backend application status and active MySQL database pool connectivity.
- **Authentication:** None (Public)
- **Response (200 OK):**
  ```json
  {
    "status": "OK",
    "uptime": 124.58,
    "timestamp": "2026-08-19T09:40:00.000Z",
    "database": "Connected",
    "service": "Online Student Course Management System"
  }
  ```
- **Response (503 Service Unavailable):**
  ```json
  {
    "status": "DEGRADED",
    "uptime": 12.4,
    "timestamp": "2026-08-19T09:40:00.000Z",
    "database": "Disconnected",
    "error": "Database connection failure"
  }
  ```

---

## 2. Authentication Endpoints

### `POST /api/auth/register`
- **Purpose:** Registers a new student user in the database, hashes the password using bcrypt, and establishes a new session.
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "full_name": "Angelin Sarah George",
    "email": "student@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful. Welcome to the course portal!",
    "user": {
      "id": 4,
      "full_name": "Angelin Sarah George",
      "email": "student@example.com",
      "role": "student"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing or invalid field format.
  - `409 Conflict`: Email already exists.
    ```json
    {
      "success": false,
      "message": "An account with this email address already exists."
    }
    ```

---

### `POST /api/auth/login`
- **Purpose:** Authenticates user credentials via bcrypt verification and establishes an active HTTP session.
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "student@courseportal.com",
    "password": "Student@123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "user": {
      "id": 2,
      "full_name": "Angelin Sarah George",
      "email": "student@courseportal.com",
      "role": "student"
    }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "message": "Invalid email or password."
  }
  ```

---

### `POST /api/auth/logout`
- **Purpose:** Terminates the current user session and clears the session cookie.
- **Authentication:** None / Any
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

---

### `GET /api/auth/me`
- **Purpose:** Retrieves the identity and role of the currently authenticated user from session store.
- **Authentication:** None (Returns authenticated: false if unauthenticated)
- **Response when Authenticated (200 OK):**
  ```json
  {
    "success": true,
    "authenticated": true,
    "user": {
      "id": 2,
      "full_name": "Angelin Sarah George",
      "email": "student@courseportal.com",
      "role": "student"
    }
  }
  ```
- **Response when Unauthenticated (200 OK):**
  ```json
  {
    "success": true,
    "authenticated": false,
    "user": null
  }
  ```

---

## 3. Course Management Endpoints

### `GET /api/courses`
- **Purpose:** Fetches the catalog of courses with real-time seat calculations, keyword search, and category filtering.
- **Authentication:** None (Public). If logged in as student, returns `is_enrolled` flag.
- **Query Parameters:**
  - `search` *(optional)*: Keyword matching title, code, instructor, or description.
  - `category` *(optional)*: Exact category filter name (e.g. `Web Development`).
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 10,
    "data": [
      {
        "id": 1,
        "course_name": "Web Application Development",
        "course_code": "WD-110",
        "instructor": "Prof. Alan Turing",
        "category": "Web Development",
        "duration": "12 Weeks",
        "description": "Comprehensive full-stack web development covering HTML5, CSS3, JavaScript, REST APIs, and backend architectures.",
        "capacity": 35,
        "created_at": "2026-08-19T09:30:00.000Z",
        "updated_at": "2026-08-19T09:30:00.000Z",
        "enrolled_count": 1,
        "available_seats": 34,
        "is_enrolled": false
      }
    ]
  }
  ```

---

### `GET /api/courses/:id`
- **Purpose:** Fetches full details for a single course including capacity metrics and student enrollment state.
- **Authentication:** None (Public)
- **URL Parameters:** `id` (integer)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "course_name": "Web Application Development",
      "course_code": "WD-110",
      "instructor": "Prof. Alan Turing",
      "category": "Web Development",
      "duration": "12 Weeks",
      "description": "Comprehensive full-stack web development covering HTML5, CSS3, JavaScript, REST APIs, and backend architectures.",
      "capacity": 35,
      "created_at": "2026-08-19T09:30:00.000Z",
      "updated_at": "2026-08-19T09:30:00.000Z",
      "enrolled_count": 1,
      "available_seats": 34,
      "is_enrolled": false,
      "user_enrollment_id": null
    }
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Course not found."
  }
  ```

---

### `POST /api/courses`
- **Purpose:** Creates a new course offering.
- **Authentication:** Required (Role: `admin`)
- **Request Body:**
  ```json
  {
    "course_name": "Distributed Cloud Architectures",
    "course_code": "CC-401",
    "instructor": "Dr. Leslie Lamport",
    "category": "Cloud & DevOps",
    "duration": "10 Weeks",
    "description": "In-depth distributed consensus and cloud system design.",
    "capacity": 40
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Course created successfully.",
    "data": {
      "id": 11,
      "course_name": "Distributed Cloud Architectures",
      "course_code": "CC-401",
      "instructor": "Dr. Leslie Lamport",
      "category": "Cloud & DevOps",
      "duration": "10 Weeks",
      "description": "In-depth distributed consensus and cloud system design.",
      "capacity": 40
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Not logged in.
  - `403 Forbidden`: Logged in user is not an administrator.
  - `409 Conflict`: Course code already exists.

---

### `PUT /api/courses/:id`
- **Purpose:** Updates existing course metadata and seat capacity.
- **Authentication:** Required (Role: `admin`)
- **URL Parameters:** `id` (integer)
- **Request Body:**
  ```json
  {
    "course_name": "Distributed Cloud Architectures (Advanced)",
    "course_code": "CC-401",
    "instructor": "Dr. Leslie Lamport",
    "category": "Cloud & DevOps",
    "duration": "12 Weeks",
    "description": "Updated syllabus with Kubernetes and fault tolerance.",
    "capacity": 45
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course updated successfully.",
    "data": {
      "id": 11,
      "course_name": "Distributed Cloud Architectures (Advanced)",
      "course_code": "CC-401",
      "instructor": "Dr. Leslie Lamport",
      "category": "Cloud & DevOps",
      "duration": "12 Weeks",
      "description": "Updated syllabus with Kubernetes and fault tolerance.",
      "capacity": 45
    }
  }
  ```

---

### `DELETE /api/courses/:id`
- **Purpose:** Deletes a course and cascades deletion to associated enrollment records.
- **Authentication:** Required (Role: `admin`)
- **URL Parameters:** `id` (integer)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course \"Distributed Cloud Architectures\" deleted successfully."
  }
  ```

---

## 4. Enrollment Endpoints

### `POST /api/enrollments`
- **Purpose:** Enrolls the authenticated student into an available course after validating capacity and preventing duplicates.
- **Authentication:** Required (Role: `student`)
- **Request Body:**
  ```json
  {
    "course_id": 3
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Successfully enrolled in \"Artificial Intelligence Basics\"."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Already enrolled, or course is at full capacity.
  - `404 Not Found`: Course does not exist.

---

### `GET /api/enrollments/my-courses`
- **Purpose:** Retrieves all active enrolled courses for the logged-in student.
- **Authentication:** Required (Role: `student`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "enrollment_id": 4,
        "enrolled_at": "2026-08-19T09:42:00.000Z",
        "enrollment_status": "enrolled",
        "course_id": 3,
        "course_name": "Artificial Intelligence Basics",
        "course_code": "AI-220",
        "instructor": "Dr. John McCarthy",
        "category": "Artificial Intelligence",
        "duration": "8 Weeks",
        "description": "Fundamental AI concepts including search algorithms, knowledge representation, logic inference, and heuristic methods.",
        "capacity": 25
      }
    ]
  }
  ```

---

### `DELETE /api/enrollments/:id`
- **Purpose:** Drops an active enrollment for the authenticated student and releases the reserved seat.
- **Authentication:** Required (Role: `student`)
- **URL Parameters:** `id` (enrollment record ID)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Successfully dropped course \"Artificial Intelligence Basics\"."
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "success": false,
    "message": "Enrollment record not found or not authorized to drop this course."
  }
  ```

---

### `GET /api/enrollments/dashboard-stats`
- **Purpose:** Aggregates dashboard metrics and recent enrollment history for the student.
- **Authentication:** Required (Role: `student`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total_courses": 10,
      "enrolled_courses": 2,
      "available_courses": 8,
      "recent_enrollments": [
        {
          "enrollment_id": 4,
          "enrolled_at": "2026-08-19T09:42:00.000Z",
          "course_id": 3,
          "course_name": "Artificial Intelligence Basics",
          "course_code": "AI-220",
          "instructor": "Dr. John McCarthy",
          "category": "Artificial Intelligence",
          "duration": "8 Weeks"
        }
      ]
    }
  }
  ```
