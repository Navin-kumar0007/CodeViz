const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { listCourses, getCourse, listCourseMeta, gradeQuiz, completeLesson, generateCourse, generateLessonVisual, setPublished, deleteCourse, adminListCourses } = require('../controllers/courseController');

// Public content (answer keys are stripped server-side).
router.get('/', listCourses);
router.get('/meta/list', listCourseMeta);
router.get('/:slug', getCourse);

// Admin content management.
router.get('/admin/all', protect, adminOnly, adminListCourses);

// Admin content generation (LLM-backed).
router.post('/generate', protect, adminOnly, generateCourse);
router.post('/:slug/lessons/:lessonId/visual/generate', protect, adminOnly, generateLessonVisual);
router.patch('/:slug', protect, adminOnly, setPublished);
router.delete('/:slug', protect, adminOnly, deleteCourse);

// Authoritative, authenticated actions.
router.post('/:slug/lessons/:lessonId/quiz', protect, gradeQuiz);
router.post('/:slug/lessons/:lessonId/complete', protect, completeLesson);

module.exports = router;
