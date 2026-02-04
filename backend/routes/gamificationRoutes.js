const express = require('express');
const router = express.Router();
const { getStats, dailyCheckIn, getLeaderboard } = require('../controllers/gamificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard', getLeaderboard);
router.use(protect);
router.get('/stats', getStats);
router.post('/checkin', dailyCheckIn);

module.exports = router;
