const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    startSession,
    submitSolution,
    recordStruggle,
    endSession,
    getHistory,
    getStats,
    saveSessionReplay
} = require('../controllers/interviewController');

// All routes require authentication
router.use(protect);

// Session management
router.post('/start', startSession);
router.post('/recruiter/create', protect, startSession); // 🔥 New: Recruiter creates invite
router.post('/submit/:sessionId', submitSolution);
router.post('/record-struggle/:sessionId', recordStruggle); // 🔥 New: Track micro-metrics
router.post('/session/:sessionId/replay', saveSessionReplay); // 🔥 New: Save full Proof-of-Work Replay
router.post('/end/:sessionId', endSession);

// History & analytics
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
