const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { listCourses, getCourse, listCourseMeta, gradeQuiz, completeLesson, generateCourse } = require('../controllers/courseController');

// Public content (answer keys are stripped server-side).
router.get('/', listCourses);
router.get('/meta/list', listCourseMeta);
router.get('/:slug', getCourse);

// Admin content generation (LLM-backed).
router.post('/generate', protect, adminOnly, generateCourse);

// Authoritative, authenticated actions.
router.post('/:slug/lessons/:lessonId/quiz', protect, gradeQuiz);
router.post('/:slug/lessons/:lessonId/complete', protect, completeLesson);

module.exports = router;
