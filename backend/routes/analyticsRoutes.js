const express = require('express');
const router = express.Router();
const {
    getClassroomAnalytics,
    getStudentProgress,
    getAssignmentAnalytics,
    getInstructorDashboard
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Instructor dashboard overview
router.get('/dashboard', getInstructorDashboard);

// Classroom analytics
router.get('/classroom/:id', getClassroomAnalytics);
router.get('/classroom/:id/students', getStudentProgress);

// Assignment/quiz analytics
router.get('/assignment/:id', getAssignmentAnalytics);

module.exports = router;
