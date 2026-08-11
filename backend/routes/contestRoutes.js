const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listContests, getContest, register, getLeaderboard } = require('../controllers/contestController');

router.get('/', listContests);                       // public list
router.get('/:slug/leaderboard', getLeaderboard);    // public leaderboard
router.get('/:slug', protect, getContest);           // detail (registered state)
router.post('/:slug/register', protect, register);

module.exports = router;
