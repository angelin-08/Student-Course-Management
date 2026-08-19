# Online Student Course Management System

**Candidate Name:** Angelin Sarah George  
**Domain:** Full Stack Web Development  
**GitHub Repository:** [https://github.com/angelin-08/Student-Course-Management](https://github.com/angelin-08/Student-Course-Management)  

---

## 📌 Project Overview
The **Online Student Course Management System** is a full-stack web application developed as an Individual Minor Internship Project. It provides a centralized, interactive platform for students to browse university courses, check real-time seat availability, enroll in courses, and manage their academic course roster. It also provides an administrative portal for course creation, modification, and capacity oversight.

---

## ✨ Key Features

### For Students
- **Account Registration & Login:** Secure student account creation with bcrypt password hashing and session management.
- **Course Catalog & Discovery:** Browse available courses with live search (by title, code, or instructor) and category filtering.
- **Real-Time Seat Availability:** View dynamic seat counts and visual progress bars reflecting available course capacity.
- **Course Details & Curriculum:** Inspect detailed course overviews, instructors, duration, and prerequisites.
- **Instant Enrollment:** One-click course enrollment with duplicate prevention and capacity checking.
- **My Enrolled Courses:** View active registrations with enrollment dates and a safe "Drop Course" action with modal confirmation.
- **Student Dashboard:** Real-time summary statistics of catalog courses, active enrollments, and recent registration history.

### For Administrators
- **Administrative Course Control:** Dedicated admin interface protected by server-side authorization middleware (`requireAdmin`).
- **Course Management (CRUD):** Add new courses, modify existing course descriptions and capacities, and remove obsolete courses.
- **Active Enrollment Protection:** Deletion confirmation warnings showing active student enrollment counts.
- **Catalog Metrics:** High-level summary of total courses, active student enrollments, and aggregate capacity.

---

## 🛠 Technology Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5 (v5.3.3), Bootstrap Icons, Vanilla JavaScript (ES6+)
- **Backend:** Node.js (v22+), Express.js (v4.19), express-session, bcrypt, mysql2 (with Promise pool), cors, dotenv
- **Database:** MySQL Server (v8+ / 26.7)
- **Architecture:** 3-Tier MVC Architecture with RESTful JSON APIs and Session Authentication

---

## 📁 Project Directory Structure

```
Student-Course-Management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool configuration
│   ├── middleware/
│   │   └── auth.js               # Session & role-based authorization guards
│   ├── routes/
│   │   ├── auth.js               # Register, login, logout, me endpoints
│   │   ├── courses.js            # Course CRUD, search, filter, seats calculation
│   │   └── enrollments.js        # Student enrollment, drop, dashboard stats
│   ├── scripts/
│   │   ├── setup-db.js           # Automated database initialization & seeding
│   │   └── test-endpoints.js     # Automated API & authorization test suite
│   ├── package.json              # Backend package configuration
│   └── server.js                 # Express server & static asset handler
│
├── database/
│   └── database.sql              # Complete SQL schema & initial seed data
│
├── documentation/
│   ├── PROJECT_DOCUMENTATION.md  # Comprehensive 23-section technical report
│   └── API_DOCUMENTATION.md      # Detailed REST API endpoint specification
│
├── frontend/
│   ├── css/
│   │   └── style.css             # Custom styles & Bootstrap theme overrides
│   ├── js/
│   │   ├── nav.js                # Dynamic role-based navigation bar handler
│   │   ├── login.js              # Login form submission & role redirect
│   │   ├── register.js           # Registration validation & account creation
│   │   ├── dashboard.js          # Student metrics & recent enrollments
│   │   ├── courses.js            # Course catalog browsing, search & filters
│   │   ├── course-details.js     # Course details & enrollment actions
│   │   ├── my-courses.js         # Student enrolled courses roster & drop modal
│   │   └── admin.js              # Admin course management panel & modals
│   ├── index.html                # Public landing page with featured courses
│   ├── login.html                # User login page
│   ├── register.html             # Student registration page
│   ├── dashboard.html            # Student dashboard page
│   ├── courses.html              # Course catalog browsing page
│   ├── course-details.html       # Single course details page
│   ├── my-courses.html           # Student enrolled courses page
│   └── admin.html                # Administrator course management page
│
├── screenshots/
│   └── README.md                 # Inventory and instructions for 14 screenshots
│
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules (ignoring .env and node_modules)
├── package.json                  # Root npm scripts & dependencies
└── README.md                     # Project overview and setup instructions
```

---

## ⚙ Prerequisites

Ensure you have the following installed on your computer:
1. **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
2. **MySQL Server** (v8.0 or higher) - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
3. **NPM** (bundled with Node.js)

---

## 🚀 Installation & Setup Guide

### 1. Clone or Download the Repository
```bash
git clone https://github.com/angelin-08/Student-Course-Management.git
cd Student-Course-Management
```

### 2. Install Dependencies
Install all required backend and utility packages:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory by copying `.env.example`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Open `.env` and fill in your local MySQL credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_course_management

# Server & Session Configuration
PORT=5000
SESSION_SECRET=your_custom_secure_session_secret_key_here
```

### 4. Initialize and Seed the Database
Run the automated database setup script to create the database schema and populate realistic courses and default test users:
```bash
npm run setup-db
```
*(Alternatively, you can import `database/database.sql` directly into MySQL Workbench or phpMyAdmin).*

### 5. Start the Application Server
Start the Express server:
```bash
npm start
```
The server will start listening at:
- **Web Application:** `http://localhost:5000`
- **Health Check Endpoint:** `http://localhost:5000/api/health`

---

## 🔑 Default Test Credentials

The database seeding script initializes the following default accounts (passwords hashed with bcrypt):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@courseportal.com` | `Admin@123` | Full Course Catalog CRUD Access (`/admin.html`) |
| **Student** | `student@courseportal.com` | `Student@123` | Course Browsing, Enrollment, Drop (`/dashboard.html`) |
| **Student (Sample 2)** | `david@example.com` | `Student@123` | Enrolled in sample courses |

*Note: New students can also register freely via `register.html`.*

---

## 🧪 Running Automated Tests

An automated test suite is included in `backend/scripts/test-endpoints.js` to verify all REST endpoints, validation logic, capacity controls, and role-based permissions.

Run the test suite:
```bash
npm test
```

### Test Suite Coverage:
- Health check verification (`GET /api/health`)
- Student registration & password hashing
- Duplicate email prevention (409 Conflict)
- Student authentication & session creation
- Authenticated user check (`GET /api/auth/me`)
- Course catalog retrieval & seat calculations
- Course keyword search
- Category filter validation
- Single course details retrieval
- Student course enrollment
- Duplicate enrollment prevention (400 Bad Request)
- Enrolled courses roster retrieval
- Student dashboard metrics aggregation
- Dropping an enrolled course
- Role enforcement: Student blocked from Admin APIs (403 Forbidden)
- Administrator authentication
- Admin course creation (`POST /api/courses`)
- Admin course updating (`PUT /api/courses/:id`)
- Admin course deletion (`DELETE /api/courses/:id`)
- User logout session termination
- Unauthorized access prevention on private routes (401 Unauthorized)
- Non-existent route handling (404 Not Found)

---

## 📚 Documentation Links

- **[Project Documentation](documentation/PROJECT_DOCUMENTATION.md):** 23-section comprehensive project report covering system architecture, ER design, module breakdown, limitations, and future enhancements.
- **[API Documentation](documentation/API_DOCUMENTATION.md):** Complete REST API specification with request/response schemas and HTTP status codes.
- **[Screenshots Guide](screenshots/README.md):** Guide and checklist for capturing the 14 application workflow screenshots.

---

## 🔒 Security & Best Practices
- **Credential Protection:** `.env` is explicitly included in `.gitignore` to prevent sensitive credentials from ever being tracked in Git.
- **Prepared Statements:** Parameterized queries via `mysql2/promise` prevent SQL injection attacks.
- **Server-Side Authorization:** Admin actions are strictly authorized on the server side using session cookies.
- **Error Sanitization:** Centralized error handling returns clean JSON messages without leaking raw database queries or stack traces.

---

## 👤 Author
**Angelin Sarah George**  
*Full Stack Web Development - Minor Internship Project*  
GitHub: [@angelin-08](https://github.com/angelin-08)
