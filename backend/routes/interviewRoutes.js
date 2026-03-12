const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    startSession,
    submitSolution,
    endSession,
    getHistory,
    getStats
} = require('../controllers/interviewController');

// All routes require authentication
router.use(protect);

// Session management
router.post('/start', startSession);
router.post('/submit/:sessionId', submitSolution);
router.post('/end/:sessionId', endSession);

// History & analytics
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
