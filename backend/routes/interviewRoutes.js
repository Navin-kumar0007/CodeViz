const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireFeature } = require('../middleware/billingMiddleware');
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

// Session management — starting an interview is a Pro feature.
router.post('/start', requireFeature('interview-prep'), startSession);
router.post('/recruiter/create', requireFeature('interview-prep'), startSession); // 🔥 New: Recruiter creates invite
router.post('/submit/:sessionId', submitSolution);
router.post('/record-struggle/:sessionId', recordStruggle); // 🔥 New: Track micro-metrics
router.post('/session/:sessionId/replay', saveSessionReplay); // 🔥 New: Save full Proof-of-Work Replay
router.post('/end/:sessionId', endSession);

// History & analytics
router.get('/history', getHistory);
router.get('/stats', getStats);

module.exports = router;
