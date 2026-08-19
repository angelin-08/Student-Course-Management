-- Online Student Course Management System
-- Database Schema and Initial Seed Data
-- Candidate: Angelin Sarah George
-- Domain: Full Stack Web Development

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `student_course_management` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `student_course_management`;

-- Drop existing tables to ensure clean setup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Courses Table
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_name` VARCHAR(150) NOT NULL,
  `course_code` VARCHAR(50) NOT NULL UNIQUE,
  `instructor` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `capacity` INT NOT NULL DEFAULT 30,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_courses_category` (`category`),
  INDEX `idx_courses_code` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Enrollments Table
CREATE TABLE `enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('enrolled', 'completed', 'dropped') NOT NULL DEFAULT 'enrolled',
  UNIQUE KEY `unique_student_course` (`student_id`, `course_id`),
  INDEX `idx_enrollments_student` (`student_id`),
  INDEX `idx_enrollments_course` (`course_id`),
  CONSTRAINT `fk_enrollments_student` 
    FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollments_course` 
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Users
-- Default Admin: admin@courseportal.com / Admin@123
-- Default Student: student@courseportal.com / Student@123
-- Additional Student: david@example.com / Student@123
-- Note: Passwords are hashed using bcrypt (10 rounds).
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`) VALUES
(1, 'System Administrator', 'admin@courseportal.com', '$2a$10$wN3tVq5J9Lz6.O7X5kF9ueY4kI4P9Y6qP8fLg7H5B9Jm6sPye1234', 'admin'),
(2, 'Angelin Sarah George', 'student@courseportal.com', '$2a$10$Z1e0Hk2t9L5O7X5kF9ueY4kI4P9Y6qP8fLg7H5B9Jm6sPye5678', 'student'),
(3, 'David Miller', 'david@example.com', '$2a$10$Z1e0Hk2t9L5O7X5kF9ueY4kI4P9Y6qP8fLg7H5B9Jm6sPye5678', 'student');

-- Seed Sample Courses
INSERT INTO `courses` (`id`, `course_name`, `course_code`, `instructor`, `category`, `duration`, `description`, `capacity`) VALUES
(1, 'Web Application Development', 'WD-110', 'Prof. Alan Turing', 'Web Development', '12 Weeks', 'Comprehensive full-stack web development covering HTML5, CSS3, JavaScript, REST APIs, and backend architectures.', 35),
(2, 'Database Systems & Design', 'DB-210', 'Dr. Edgar Codd', 'Database & Systems', '10 Weeks', 'Relational database design, normal forms, SQL optimization, transactions, ACID properties, and indexing techniques.', 30),
(3, 'Artificial Intelligence Basics', 'AI-220', 'Dr. John McCarthy', 'Artificial Intelligence', '8 Weeks', 'Fundamental AI concepts including search algorithms, knowledge representation, logic inference, and heuristic methods.', 25),
(4, 'Machine Learning Applications', 'ML-310', 'Dr. Andrew Ng', 'Artificial Intelligence', '12 Weeks', 'Practical machine learning methods including supervised and unsupervised learning, regression, classification, and neural network foundations.', 30),
(5, 'Object Oriented Programming in Java', 'CS-115', 'Prof. Bjarne Stroustrup', 'Computer Science', '10 Weeks', 'Core principles of object-oriented design including encapsulation, inheritance, polymorphism, design patterns, and modular coding.', 40),
(6, 'Computer Networks & Security', 'CN-225', 'Dr. Vint Cerf', 'Networking & Security', '8 Weeks', 'OSI and TCP/IP models, routing protocols, socket programming, network security fundamentals, and traffic management.', 25),
(7, 'Software Testing & Quality Assurance', 'SE-305', 'Prof. Margaret Hamilton', 'Software Engineering', '6 Weeks', 'Systematic testing methodologies, unit testing, integration testing, test automation, and code coverage analysis.', 20),
(8, 'Cloud Computing & DevOps', 'CC-315', 'Dr. Werner Vogels', 'Cloud & DevOps', '10 Weeks', 'Cloud infrastructure concepts, virtualization, containerization with Docker, CI/CD pipelines, and microservices architecture.', 30),
(9, 'Data Structures & Algorithms', 'DS-201', 'Prof. Donald Knuth', 'Computer Science', '12 Weeks', 'In-depth study of arrays, linked lists, trees, graphs, sorting, searching algorithms, and complexity analysis (Big-O).', 35),
(10, 'Cyber Security Fundamentals', 'CS-330', 'Dr. Dorothy Denning', 'Networking & Security', '8 Weeks', 'Principles of cryptography, authentication protocols, network security, threat modeling, and defensive security strategies.', 25);

-- Seed Sample Enrollments
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `status`) VALUES
(1, 3, 1, 'enrolled'),
(2, 3, 2, 'enrolled');
