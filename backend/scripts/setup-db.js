/**
 * Database Setup & Seeding Script
 * Online Student Course Management System
 * Candidate: Angelin Sarah George
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'student_course_management';

async function setupDatabase() {
  let connection;
  try {
    console.log(`Connecting to MySQL server at ${dbHost}:${dbPort} as user "${dbUser}"...`);
    
    // Connect without selecting database to ensure we can create it
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });

    console.log('MySQL server connection successful.');

    // 1. Create database
    console.log(`Creating database "${dbName}" if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // 2. Disable foreign key checks for clean setup
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('DROP TABLE IF EXISTS `enrollments`;');
    await connection.query('DROP TABLE IF EXISTS `courses`;');
    await connection.query('DROP TABLE IF EXISTS `users`;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 3. Create Users Table
    console.log('Creating "users" table...');
    await connection.query(`
      CREATE TABLE \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('student', 'admin') NOT NULL DEFAULT 'student',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_users_email\` (\`email\`),
        INDEX \`idx_users_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create Courses Table
    console.log('Creating "courses" table...');
    await connection.query(`
      CREATE TABLE \`courses\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`course_name\` VARCHAR(150) NOT NULL,
        \`course_code\` VARCHAR(50) NOT NULL UNIQUE,
        \`instructor\` VARCHAR(100) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`duration\` VARCHAR(50) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`capacity\` INT NOT NULL DEFAULT 30,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_courses_category\` (\`category\`),
        INDEX \`idx_courses_code\` (\`course_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create Enrollments Table
    console.log('Creating "enrollments" table...');
    await connection.query(`
      CREATE TABLE \`enrollments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`student_id\` INT NOT NULL,
        \`course_id\` INT NOT NULL,
        \`enrolled_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`status\` ENUM('enrolled', 'completed', 'dropped') NOT NULL DEFAULT 'enrolled',
        UNIQUE KEY \`unique_student_course\` (\`student_id\`, \`course_id\`),
        INDEX \`idx_enrollments_student\` (\`student_id\`),
        INDEX \`idx_enrollments_course\` (\`course_id\`),
        CONSTRAINT \`fk_enrollments_student\` 
          FOREIGN KEY (\`student_id\`) REFERENCES \`users\` (\`id\`) 
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_enrollments_course\` 
          FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`) 
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Generate Password Hashes
    console.log('Generating secure bcrypt hashes for default users...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const studentPasswordHash = await bcrypt.hash('Student@123', 10);

    // 7. Seed Users
    console.log('Seeding default users...');
    await connection.query(`
      INSERT INTO \`users\` (\`id\`, \`full_name\`, \`email\`, \`password\`, \`role\`) VALUES
      (1, 'System Administrator', 'admin@courseportal.com', ?, 'admin'),
      (2, 'Angelin Sarah George', 'student@courseportal.com', ?, 'student'),
      (3, 'David Miller', 'david@example.com', ?, 'student')
    `, [adminPasswordHash, studentPasswordHash, studentPasswordHash]);

    // 8. Seed Sample Courses
    console.log('Seeding realistic sample courses...');
    const sampleCourses = [
      ['Web Application Development', 'WD-110', 'Prof. Alan Turing', 'Web Development', '12 Weeks', 'Comprehensive full-stack web development covering HTML5, CSS3, JavaScript, REST APIs, and backend architectures.', 35],
      ['Database Systems & Design', 'DB-210', 'Dr. Edgar Codd', 'Database & Systems', '10 Weeks', 'Relational database design, normal forms, SQL optimization, transactions, ACID properties, and indexing techniques.', 30],
      ['Artificial Intelligence Basics', 'AI-220', 'Dr. John McCarthy', 'Artificial Intelligence', '8 Weeks', 'Fundamental AI concepts including search algorithms, knowledge representation, logic inference, and heuristic methods.', 25],
      ['Machine Learning Applications', 'ML-310', 'Dr. Andrew Ng', 'Artificial Intelligence', '12 Weeks', 'Practical machine learning methods including supervised and unsupervised learning, regression, classification, and neural network foundations.', 30],
      ['Object Oriented Programming in Java', 'CS-115', 'Prof. Bjarne Stroustrup', 'Computer Science', '10 Weeks', 'Core principles of object-oriented design including encapsulation, inheritance, polymorphism, design patterns, and modular coding.', 40],
      ['Computer Networks & Security', 'CN-225', 'Dr. Vint Cerf', 'Networking & Security', '8 Weeks', 'OSI and TCP/IP models, routing protocols, socket programming, network security fundamentals, and traffic management.', 25],
      ['Software Testing & Quality Assurance', 'SE-305', 'Prof. Margaret Hamilton', 'Software Engineering', '6 Weeks', 'Systematic testing methodologies, unit testing, integration testing, test automation, and code coverage analysis.', 20],
      ['Cloud Computing & DevOps', 'CC-315', 'Dr. Werner Vogels', 'Cloud & DevOps', '10 Weeks', 'Cloud infrastructure concepts, virtualization, containerization with Docker, CI/CD pipelines, and microservices architecture.', 30],
      ['Data Structures & Algorithms', 'DS-201', 'Prof. Donald Knuth', 'Computer Science', '12 Weeks', 'In-depth study of arrays, linked lists, trees, graphs, sorting, searching algorithms, and complexity analysis (Big-O).', 35],
      ['Cyber Security Fundamentals', 'CS-330', 'Dr. Dorothy Denning', 'Networking & Security', '8 Weeks', 'Principles of cryptography, authentication protocols, network security, threat modeling, and defensive security strategies.', 25]
    ];

    for (const course of sampleCourses) {
      await connection.query(`
        INSERT INTO \`courses\` (\`course_name\`, \`course_code\`, \`instructor\`, \`category\`, \`duration\`, \`description\`, \`capacity\`)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, course);
    }

    // 9. Seed Sample Enrollments
    console.log('Seeding initial sample enrollments...');
    await connection.query(`
      INSERT INTO \`enrollments\` (\`student_id\`, \`course_id\`, \`status\`) VALUES
      (3, 1, 'enrolled'),
      (3, 2, 'enrolled')
    `);

    console.log('====================================================');
    console.log(' Database initialization completed successfully!');
    console.log(' Database: student_course_management');
    console.log(' Tables created: users, courses, enrollments');
    console.log(' Seeded 3 default users:');
    console.log('   - Admin:   admin@courseportal.com (Password: Admin@123)');
    console.log('   - Student: student@courseportal.com (Password: Student@123)');
    console.log('   - Student: david@example.com (Password: Student@123)');
    console.log(' Seeded 10 sample courses');
    console.log(' Seeded 2 sample enrollments');
    console.log('====================================================');

  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
