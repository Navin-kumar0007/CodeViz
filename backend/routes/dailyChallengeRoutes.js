const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getTodaysChallenge,
    submitChallenge,
    getChallengeHistory,
    getTodaysTiered,
    replayChallenge
} = require('../controllers/dailyChallengeController');

// @route   GET /api/challenges/today
router.get('/today', protect, getTodaysChallenge);

// @route   POST /api/challenges/submit
router.post('/submit', protect, submitChallenge);

// @route   GET /api/challenges/history
router.get('/history', protect, getChallengeHistory);

// @route   GET /api/challenges/tiered
router.get('/tiered', protect, getTodaysTiered);

// @route   GET /api/challenges/replay/:id
router.get('/replay/:id', protect, replayChallenge);

module.exports = router;
