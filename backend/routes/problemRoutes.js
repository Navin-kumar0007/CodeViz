const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProblems, getProblem, createProblem, getRandomProblem } = require('../controllers/problemController');
const { submitSolution, getSubmissions, getSubmissionStats } = require('../controllers/submissionController');

// Problem routes
router.get('/', protect, getProblems);
router.get('/random', protect, getRandomProblem);
router.get('/:slug', protect, getProblem);
router.post('/', protect, createProblem);

// Submission routes
router.post('/submit', protect, submitSolution);
router.get('/submissions/stats', protect, getSubmissionStats);
router.get('/submissions/:problemId', protect, getSubmissions);

module.exports = router;
