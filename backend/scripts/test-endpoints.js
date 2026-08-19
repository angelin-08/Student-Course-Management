/**
 * Automated API & Authorization Test Suite
 * Online Student Course Management System
 * Candidate: Angelin Sarah George
 */

const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../server');

let server;
const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper to make HTTP requests with cookie handling
function makeRequest({ method = 'GET', path = '/', headers = {}, body = null, cookie = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };

    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        let parsedData = null;
        try {
          parsedData = JSON.parse(responseBody);
        } catch (e) {
          parsedData = responseBody;
        }

        // Extract cookies if any
        const setCookie = res.headers['set-cookie'];
        let sessionCookie = null;
        if (setCookie) {
          sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsedData,
          cookie: sessionCookie
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTest(testName, testFn) {
  totalTests++;
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${duration}ms] ${testName}`);
    testResults.push({ name: testName, status: 'PASS', duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    failedTests++;
    console.log(`  \x1b[31m✖ FAIL\x1b[0m [${duration}ms] ${testName}`);
    console.log(`         \x1b[33mError: ${error.message}\x1b[0m`);
    testResults.push({ name: testName, status: 'FAIL', duration, error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function startTestSuite() {
  console.log('====================================================');
  console.log(' Starting Automated API Test Suite');
  console.log(' Target Server: localhost:3306 (MySQL)');
  console.log(' Candidate:     Angelin Sarah George');
  console.log('====================================================\n');

  // Start test server instance
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      resolve();
    });
  });

  // State variables across tests
  let studentCookie = null;
  let adminCookie = null;
  const testStudentEmail = `test_student_${Date.now()}@example.com`;
  const testStudentPassword = 'TestPassword123!';
  let createdCourseId = null;
  let studentEnrollmentId = null;

  try {
    // 1. Health Check
    await runTest('Health check endpoint returns 200 and database connected status', async () => {
      const res = await makeRequest({ method: 'GET', path: '/api/health' });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.status === 'OK', `Expected status OK, got ${res.data.status}`);
      assert(res.data.database === 'Connected', `Expected DB Connected, got ${res.data.database}`);
    });

    // 2. Student Registration
    await runTest('Student registration creates new user account and initializes session', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          full_name: 'Test Student User',
          email: testStudentEmail,
          password: testStudentPassword
        }
      });
      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.success === true, 'Expected success === true');
      assert(res.data.user.role === 'student', 'Expected role === student');
      assert(res.cookie !== null, 'Expected session cookie to be set');
      studentCookie = res.cookie;
    });

    // 3. Duplicate Registration
    await runTest('Duplicate registration with same email is prevented (409 Conflict)', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: {
          full_name: 'Duplicate Student',
          email: testStudentEmail,
          password: testStudentPassword
        }
      });
      assert(res.status === 409, `Expected status 409, got ${res.status}`);
      assert(res.data.success === false, 'Expected success === false');
    });

    // 4. Student Login
    await runTest('Student login with correct credentials returns 200 and session', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/auth/login',
        body: {
          email: testStudentEmail,
          password: testStudentPassword
        }
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.success === true, 'Expected success === true');
      assert(res.data.user.email === testStudentEmail, 'Expected matching email');
      studentCookie = res.cookie || studentCookie;
    });

    // 5. Current User / Me
    await runTest('Current user endpoint (/api/auth/me) returns authenticated student data', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/auth/me',
        cookie: studentCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.authenticated === true, 'Expected authenticated === true');
      assert(res.data.user.email === testStudentEmail, 'Expected matching email');
      assert(res.data.user.role === 'student', 'Expected role === student');
    });

    // 6. Course Listing
    await runTest('Course listing returns full course catalog with seat calculations', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/courses',
        cookie: studentCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.success === true, 'Expected success === true');
      assert(Array.isArray(res.data.data), 'Expected data to be an array');
      assert(res.data.data.length >= 10, `Expected at least 10 courses, got ${res.data.data.length}`);
      
      const firstCourse = res.data.data[0];
      assert('capacity' in firstCourse, 'Expected capacity field in course');
      assert('enrolled_count' in firstCourse, 'Expected enrolled_count in course');
      assert('available_seats' in firstCourse, 'Expected available_seats in course');
    });

    // 7. Course Search
    await runTest('Course search filters courses correctly by keyword query', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/courses?search=Web'
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.length > 0, 'Expected at least 1 search result for "Web"');
      const found = res.data.data.some(c => c.course_name.includes('Web') || c.course_code.includes('WD'));
      assert(found, 'Expected search results to match keyword');
    });

    // 8. Category Filter
    await runTest('Category filter returns only courses matching specified category', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/courses?category=Artificial+Intelligence'
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.length >= 2, `Expected at least 2 AI courses, got ${res.data.data.length}`);
      const allMatch = res.data.data.every(c => c.category === 'Artificial Intelligence');
      assert(allMatch, 'All returned courses must match the category filter');
    });

    // 9. Course Details
    await runTest('Course details endpoint returns full course details by ID', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/courses/1',
        cookie: studentCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.id === 1, 'Expected course ID === 1');
      assert(res.data.data.course_code === 'WD-110', 'Expected course code WD-110');
      assert('available_seats' in res.data.data, 'Expected available_seats field');
    });

    // 10. Student Course Enrollment
    await runTest('Student successfully enrolls in an available course', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/enrollments',
        cookie: studentCookie,
        body: { course_id: 3 }
      });
      assert(res.status === 201, `Expected status 201, got ${res.status}`);
      assert(res.data.success === true, 'Expected enrollment success === true');
    });

    // 11. Duplicate Enrollment Prevention
    await runTest('Duplicate enrollment in the same course is blocked (400 Bad Request)', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/enrollments',
        cookie: studentCookie,
        body: { course_id: 3 }
      });
      assert(res.status === 400, `Expected status 400, got ${res.status}`);
      assert(res.data.success === false, 'Expected success === false');
    });

    // 12. Student My Courses
    await runTest('Student retrieves active enrolled courses list', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/enrollments/my-courses',
        cookie: studentCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.length >= 1, 'Expected at least 1 enrolled course');
      const enrolledCourse = res.data.data.find(e => e.course_id === 3);
      assert(enrolledCourse !== undefined, 'Expected course ID 3 in enrolled courses');
      studentEnrollmentId = enrolledCourse.enrollment_id;
    });

    // 13. Student Dashboard Statistics
    await runTest('Student dashboard statistics endpoint returns correct aggregated metrics', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/enrollments/dashboard-stats',
        cookie: studentCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.data.total_courses >= 10, 'Expected total_courses >= 10');
      assert(res.data.data.enrolled_courses >= 1, 'Expected enrolled_courses >= 1');
      assert(Array.isArray(res.data.data.recent_enrollments), 'Expected recent_enrollments array');
    });

    // 14. Drop Course
    await runTest('Student drops an enrolled course successfully', async () => {
      assert(studentEnrollmentId !== null, 'Valid student enrollment ID required');
      const res = await makeRequest({
        method: 'DELETE',
        path: `/api/enrollments/${studentEnrollmentId}`,
        cookie: studentCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.success === true, 'Expected drop success === true');
    });

    // 15. Student Blocked from Admin APIs
    await runTest('Student is blocked from administrative course creation (403 Forbidden)', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/courses',
        cookie: studentCookie,
        body: {
          course_name: 'Unauthorized Course',
          course_code: 'UNAUTH-01',
          instructor: 'Hacker',
          category: 'Computer Science',
          duration: '4 Weeks',
          description: 'Should not be allowed',
          capacity: 20
        }
      });
      assert(res.status === 403, `Expected status 403 Forbidden, got ${res.status}`);
      assert(res.data.success === false, 'Expected success === false');
    });

    // 16. Admin Login
    await runTest('Admin login with default admin credentials returns 200 and admin role', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/auth/login',
        body: {
          email: 'admin@courseportal.com',
          password: 'Admin@123'
        }
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.success === true, 'Expected success === true');
      assert(res.data.user.role === 'admin', 'Expected role === admin');
      adminCookie = res.cookie;
    });

    // 17. Admin Create Course
    await runTest('Admin creates a new course with valid parameters', async () => {
      const uniqueCode = `TEST-${Date.now().toString().slice(-4)}`;
      const res = await makeRequest({
        method: 'POST',
        path: '/api/courses',
        cookie: adminCookie,
        body: {
          course_name: 'Advanced Distributed Architectures',
          course_code: uniqueCode,
          instructor: 'Dr. Leslie Lamport',
          category: 'Cloud & DevOps',
          duration: '10 Weeks',
          description: 'In-depth distributed algorithms, consensus mechanisms, and fault-tolerant cloud architecture.',
          capacity: 45
        }
      });
      assert(res.status === 201, `Expected status 201 Created, got ${res.status}`);
      assert(res.data.success === true, 'Expected success === true');
      assert(res.data.data.id !== undefined, 'Expected created course ID');
      createdCourseId = res.data.data.id;
    });

    // 18. Admin Update Course
    await runTest('Admin updates existing course details', async () => {
      assert(createdCourseId !== null, 'Valid course ID required for update test');
      const res = await makeRequest({
        method: 'PUT',
        path: `/api/courses/${createdCourseId}`,
        cookie: adminCookie,
        body: {
          course_name: 'Advanced Distributed Architectures (Updated)',
          course_code: `TEST-${Date.now().toString().slice(-4)}`,
          instructor: 'Dr. Leslie Lamport',
          category: 'Cloud & DevOps',
          duration: '12 Weeks',
          description: 'Updated comprehensive curriculum on distributed systems and Paxos algorithms.',
          capacity: 50
        }
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.success === true, 'Expected update success === true');
      assert(res.data.data.capacity === 50, 'Expected updated capacity === 50');
    });

    // 19. Admin Delete Course
    await runTest('Admin deletes a course successfully', async () => {
      assert(createdCourseId !== null, 'Valid course ID required for delete test');
      const res = await makeRequest({
        method: 'DELETE',
        path: `/api/courses/${createdCourseId}`,
        cookie: adminCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.success === true, 'Expected delete success === true');
    });

    // 20. Logout
    await runTest('Logout endpoint destroys session and clears session cookie', async () => {
      const res = await makeRequest({
        method: 'POST',
        path: '/api/auth/logout',
        cookie: studentCookie
      });
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      assert(res.data.success === true, 'Expected success === true');
    });

    // 21. Unauthorized Access Prevention
    await runTest('Protected endpoint rejects unauthorized request after logout (401 Unauthorized)', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/enrollments/my-courses'
      });
      assert(res.status === 401, `Expected status 401 Unauthorized, got ${res.status}`);
      assert(res.data.success === false, 'Expected success === false');
    });

    // 22. Invalid Route Handling
    await runTest('Non-existent API route returns 404 Not Found JSON response', async () => {
      const res = await makeRequest({
        method: 'GET',
        path: '/api/invalid-non-existent-endpoint'
      });
      assert(res.status === 404, `Expected status 404, got ${res.status}`);
      assert(res.data.success === false, 'Expected success === false');
    });

  } finally {
    // Close server
    if (server) {
      server.close();
    }
  }

  // Print final summary report
  console.log('\n====================================================');
  console.log('              AUTOMATED TEST RESULTS                ');
  console.log('====================================================');
  console.log(` Total Tests Executed: ${totalTests}`);
  console.log(` Passed Tests:         \x1b[32m${passedTests}\x1b[0m`);
  console.log(` Failed Tests:         \x1b[31m${failedTests}\x1b[0m`);
  console.log(` Success Rate:         ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  startTestSuite();
}

module.exports = startTestSuite;
