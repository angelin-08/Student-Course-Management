const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { testConnection } = require('./config/db');
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const enrollmentsRoutes = require('./routes/enrollments');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'student_course_management_fallback_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: false, // Set to true if HTTPS in production
    sameSite: 'lax'
  }
}));

// Static Files - Serve Frontend Assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  
  if (dbStatus.connected) {
    return res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'Connected',
      service: 'Online Student Course Management System'
    });
  } else {
    return res.status(503).json({
      status: 'DEGRADED',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: 'Database connection failure'
    });
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);

// Fallback for API 404s
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Route for single page navigation fallbacks
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error Occurred]:', err.message || err);

  // Avoid exposing sensitive database errors directly
  let statusCode = err.status || 500;
  let userMessage = err.message || 'An unexpected internal server error occurred.';

  // Generic DB error sanitization
  if (err.code && err.code.startsWith('ER_')) {
    statusCode = 500;
    userMessage = 'A database error occurred while processing your request. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    message: userMessage
  });
});

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Online Student Course Management System Server`);
    console.log(`  Candidate: Angelin Sarah George`);
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log(`  Health check at:   http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
