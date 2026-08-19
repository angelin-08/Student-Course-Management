const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/courses
 * @desc    Get all courses with optional search, category filter, and real-time seat availability
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const currentStudentId = (req.session && req.session.user && req.session.user.role === 'student') 
      ? req.session.user.id 
      : null;

    let query = `
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.instructor,
        c.category,
        c.duration,
        c.description,
        c.capacity,
        c.created_at,
        c.updated_at,
        COUNT(CASE WHEN e.status = 'enrolled' THEN 1 END) AS enrolled_count,
        GREATEST(c.capacity - COUNT(CASE WHEN e.status = 'enrolled' THEN 1 END), 0) AS available_seats
        ${currentStudentId ? `, MAX(CASE WHEN e.student_id = ? AND e.status = 'enrolled' THEN 1 ELSE 0 END) AS is_enrolled` : ', 0 AS is_enrolled'}
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE 1=1
    `;

    const queryParams = [];
    if (currentStudentId) {
      queryParams.push(currentStudentId);
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (c.course_name LIKE ? OR c.course_code LIKE ? OR c.instructor LIKE ? OR c.description LIKE ?)`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category && category.trim() !== '' && category !== 'All') {
      query += ` AND c.category = ?`;
      queryParams.push(category.trim());
    }

    query += ` GROUP BY c.id ORDER BY c.id ASC`;

    const [courses] = await pool.query(query, queryParams);

    const formattedCourses = courses.map(course => ({
      ...course,
      enrolled_count: Number(course.enrolled_count),
      available_seats: Number(course.available_seats),
      is_enrolled: Boolean(Number(course.is_enrolled))
    }));

    return res.status(200).json({
      success: true,
      count: formattedCourses.length,
      data: formattedCourses
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get detailed course information by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format.'
      });
    }

    const currentStudentId = (req.session && req.session.user && req.session.user.role === 'student') 
      ? req.session.user.id 
      : null;

    const query = `
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.instructor,
        c.category,
        c.duration,
        c.description,
        c.capacity,
        c.created_at,
        c.updated_at,
        COUNT(CASE WHEN e.status = 'enrolled' THEN 1 END) AS enrolled_count,
        GREATEST(c.capacity - COUNT(CASE WHEN e.status = 'enrolled' THEN 1 END), 0) AS available_seats
        ${currentStudentId ? `, MAX(CASE WHEN e.student_id = ? AND e.status = 'enrolled' THEN 1 ELSE 0 END) AS is_enrolled` : ', 0 AS is_enrolled'}
        ${currentStudentId ? `, MAX(CASE WHEN e.student_id = ? AND e.status = 'enrolled' THEN e.id ELSE NULL END) AS user_enrollment_id` : ', NULL AS user_enrollment_id'}
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const queryParams = [];
    if (currentStudentId) {
      queryParams.push(currentStudentId, currentStudentId);
    }
    queryParams.push(courseId);

    const [rows] = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    const course = rows[0];
    const formattedCourse = {
      ...course,
      enrolled_count: Number(course.enrolled_count),
      available_seats: Number(course.available_seats),
      is_enrolled: Boolean(Number(course.is_enrolled)),
      user_enrollment_id: course.user_enrollment_id ? Number(course.user_enrollment_id) : null
    };

    return res.status(200).json({
      success: true,
      data: formattedCourse
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/courses
 * @desc    Create a new course (Admin only)
 * @access  Private (Admin)
 */
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { course_name, course_code, instructor, category, duration, description, capacity } = req.body;

    // Field validation
    if (!course_name || !course_name.trim()) {
      return res.status(400).json({ success: false, message: 'Course name is required.' });
    }
    if (!course_code || !course_code.trim()) {
      return res.status(400).json({ success: false, message: 'Course code is required.' });
    }
    if (!instructor || !instructor.trim()) {
      return res.status(400).json({ success: false, message: 'Instructor name is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    if (!duration || !duration.trim()) {
      return res.status(400).json({ success: false, message: 'Duration is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ success: false, message: 'Course capacity must be a positive integer.' });
    }

    const cleanCode = course_code.trim().toUpperCase();

    // Check for duplicate course code
    const [existing] = await pool.query('SELECT id FROM courses WHERE course_code = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `A course with code "${cleanCode}" already exists.`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO courses (course_name, course_code, instructor, category, duration, description, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course_name.trim(), cleanCode, instructor.trim(), category.trim(), duration.trim(), description.trim(), parsedCapacity]
    );

    const newCourse = {
      id: result.insertId,
      course_name: course_name.trim(),
      course_code: cleanCode,
      instructor: instructor.trim(),
      category: category.trim(),
      duration: duration.trim(),
      description: description.trim(),
      capacity: parsedCapacity
    };

    return res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: newCourse
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/courses/:id
 * @desc    Update an existing course (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID.' });
    }

    // Check if course exists
    const [existingCourse] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (existingCourse.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const { course_name, course_code, instructor, category, duration, description, capacity } = req.body;

    if (!course_name || !course_name.trim()) {
      return res.status(400).json({ success: false, message: 'Course name is required.' });
    }
    if (!course_code || !course_code.trim()) {
      return res.status(400).json({ success: false, message: 'Course code is required.' });
    }
    if (!instructor || !instructor.trim()) {
      return res.status(400).json({ success: false, message: 'Instructor name is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    if (!duration || !duration.trim()) {
      return res.status(400).json({ success: false, message: 'Duration is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ success: false, message: 'Course capacity must be a positive integer.' });
    }

    const cleanCode = course_code.trim().toUpperCase();

    // Check if duplicate course code used by another course
    const [duplicateCheck] = await pool.query(
      'SELECT id FROM courses WHERE course_code = ? AND id != ?',
      [cleanCode, courseId]
    );

    if (duplicateCheck.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Course code "${cleanCode}" is already in use by another course.`
      });
    }

    await pool.query(
      `UPDATE courses 
       SET course_name = ?, course_code = ?, instructor = ?, category = ?, duration = ?, description = ?, capacity = ?
       WHERE id = ?`,
      [course_name.trim(), cleanCode, instructor.trim(), category.trim(), duration.trim(), description.trim(), parsedCapacity, courseId]
    );

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      data: {
        id: courseId,
        course_name: course_name.trim(),
        course_code: cleanCode,
        instructor: instructor.trim(),
        category: category.trim(),
        duration: duration.trim(),
        description: description.trim(),
        capacity: parsedCapacity
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course and its enrollments (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID.' });
    }

    const [existing] = await pool.query('SELECT course_name FROM courses WHERE id = ?', [courseId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Delete course (foreign key cascade removes associated enrollments)
    await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);

    return res.status(200).json({
      success: true,
      message: `Course "${existing[0].course_name}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
