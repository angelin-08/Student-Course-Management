const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

// Regular expression for basic email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;

    // Validate inputs
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required and cannot be empty.'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanFullName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new student user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [cleanFullName, cleanEmail, hashedPassword, 'student']
    );

    const newUser = {
      id: result.insertId,
      full_name: cleanFullName,
      email: cleanEmail,
      role: 'student'
    };

    // Initialize session for newly registered user
    req.session.user = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to the course portal!',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and create session
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user by email
    const [users] = await pool.query(
      'SELECT id, full_name, email, password, role FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Set session user
    const authenticatedUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };

    req.session.user = authenticatedUser;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: authenticatedUser
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Destroy session and log out user
 * @access  Public
 */
router.post('/logout', (req, res, next) => {
  try {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Failed to log out. Please try again.'
          });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({
          success: true,
          message: 'Logged out successfully.'
        });
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user info
 * @access  Public (returns null if unauthenticated)
 */
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      success: true,
      authenticated: true,
      user: req.session.user
    });
  }
  return res.status(200).json({
    success: true,
    authenticated: false,
    user: null
  });
});

module.exports = router;
