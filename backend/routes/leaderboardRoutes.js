const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserRank, getWeeklyLeaderboard, getSkillLeaderboard } = require('../controllers/leaderboardController');

// Public routes
router.get('/', getLeaderboard);
router.get('/rank/:userId', getUserRank);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/skill/:category', getSkillLeaderboard);

module.exports = router;
