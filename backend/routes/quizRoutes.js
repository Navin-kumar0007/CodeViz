const express = require('express');
const router = express.Router();
const { protect, instructorOnly } = require('../middleware/authMiddleware');
const {
    createQuiz,
    getQuizzes,
    getMyQuizzes,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    completeQuiz
} = require('../controllers/quizController');

// Public routes
router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.post('/:id/complete', completeQuiz);

// Instructor only routes
router.post('/', protect, instructorOnly, createQuiz);
router.get('/my/quizzes', protect, instructorOnly, getMyQuizzes);
router.put('/:id', protect, instructorOnly, updateQuiz);
router.delete('/:id', protect, instructorOnly, deleteQuiz);

module.exports = router;
