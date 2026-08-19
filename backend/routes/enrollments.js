const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireStudent } = require('../middleware/auth');

/**
 * @route   POST /api/enrollments
 * @desc    Enroll authenticated student in a course
 * @access  Private (Student)
 */
router.post('/', requireStudent, async (req, res, next) => {
  try {
    const studentId = req.session.user.id;
    const { course_id } = req.body;

    const courseId = parseInt(course_id, 10);
    if (!courseId || isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid course ID is required.'
      });
    }

    // Check if course exists
    const [courseRows] = await pool.query(
      'SELECT id, course_name, capacity FROM courses WHERE id = ?',
      [courseId]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    const course = courseRows[0];

    // Check if student is already actively enrolled
    const [existingEnrollment] = await pool.query(
      `SELECT id, status FROM enrollments WHERE student_id = ? AND course_id = ?`,
      [studentId, courseId]
    );

    if (existingEnrollment.length > 0 && existingEnrollment[0].status === 'enrolled') {
      return res.status(400).json({
        success: false,
        message: `You are already enrolled in "${course.course_name}".`
      });
    }

    // Check current course capacity
    const [enrollmentCountRow] = await pool.query(
      `SELECT COUNT(*) AS active_count FROM enrollments WHERE course_id = ? AND status = 'enrolled'`,
      [courseId]
    );

    const activeCount = parseInt(enrollmentCountRow[0].active_count, 10);
    if (activeCount >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: `Course "${course.course_name}" is currently full (Capacity: ${course.capacity}).`
      });
    }

    // Insert or update enrollment
    if (existingEnrollment.length > 0) {
      await pool.query(
        `UPDATE enrollments SET status = 'enrolled', enrolled_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [existingEnrollment[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'enrolled')`,
        [studentId, courseId]
      );
    }

    return res.status(201).json({
      success: true,
      message: `Successfully enrolled in "${course.course_name}".`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/enrollments/my-courses
 * @desc    Get all active enrolled courses for the logged-in student
 * @access  Private (Student)
 */
router.get('/my-courses', requireStudent, async (req, res, next) => {
  try {
    const studentId = req.session.user.id;

    const query = `
      SELECT 
        e.id AS enrollment_id,
        e.enrolled_at,
        e.status AS enrollment_status,
        c.id AS course_id,
        c.course_name,
        c.course_code,
        c.instructor,
        c.category,
        c.duration,
        c.description,
        c.capacity
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ? AND e.status = 'enrolled'
      ORDER BY e.enrolled_at DESC
    `;

    const [rows] = await pool.query(query, [studentId]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Drop an enrolled course for the logged-in student
 * @access  Private (Student)
 */
router.delete('/:id', requireStudent, async (req, res, next) => {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const studentId = req.session.user.id;

    if (isNaN(enrollmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment ID.'
      });
    }

    // Verify enrollment belongs to this student
    const [enrollmentRows] = await pool.query(
      `SELECT e.id, c.course_name 
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = ? AND e.student_id = ? AND e.status = 'enrolled'`,
      [enrollmentId, studentId]
    );

    if (enrollmentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment record not found or not authorized to drop this course.'
      });
    }

    const courseName = enrollmentRows[0].course_name;

    // Delete enrollment record
    await pool.query('DELETE FROM enrollments WHERE id = ?', [enrollmentId]);

    return res.status(200).json({
      success: true,
      message: `Successfully dropped course "${courseName}".`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/enrollments/dashboard-stats
 * @desc    Get summary statistics for student dashboard
 * @access  Private (Student)
 */
router.get('/dashboard-stats', requireStudent, async (req, res, next) => {
  try {
    const studentId = req.session.user.id;

    // 1. Total available courses in catalog
    const [totalCoursesRow] = await pool.query('SELECT COUNT(*) AS total FROM courses');
    const totalCourses = totalCoursesRow[0].total;

    // 2. Student's active enrolled courses count
    const [enrolledCountRow] = await pool.query(
      `SELECT COUNT(*) AS count FROM enrollments WHERE student_id = ? AND status = 'enrolled'`,
      [studentId]
    );
    const enrolledCoursesCount = enrolledCountRow[0].count;

    // 3. Recent enrollments list (up to 5)
    const [recentEnrollments] = await pool.query(
      `SELECT 
        e.id AS enrollment_id,
        e.enrolled_at,
        c.id AS course_id,
        c.course_name,
        c.course_code,
        c.instructor,
        c.category,
        c.duration
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = ? AND e.status = 'enrolled'
       ORDER BY e.enrolled_at DESC
       LIMIT 5`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      data: {
        total_courses: Number(totalCourses),
        enrolled_courses: Number(enrolledCoursesCount),
        available_courses: Math.max(0, Number(totalCourses) - Number(enrolledCoursesCount)),
        recent_enrollments: recentEnrollments
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
