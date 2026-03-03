const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getTodaysChallenge,
    submitChallenge,
    getChallengeHistory
} = require('../controllers/dailyChallengeController');

// @route   GET /api/challenges/today
router.get('/today', protect, getTodaysChallenge);

// @route   POST /api/challenges/submit
router.post('/submit', protect, submitChallenge);

// @route   GET /api/challenges/history
router.get('/history', protect, getChallengeHistory);

module.exports = router;
