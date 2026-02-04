const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const gamificationService = require('../services/gamificationService');

// @desc    Get user gamification stats
// @route   GET /api/gamification/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('streak xp badges completedChallenges');
    if (user) {
        res.json({
            streak: user.streak,
            xp: user.xp,
            level: Math.floor(user.xp / 100) + 1,
            badges: user.badges,
            challenges: user.completedChallenges
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Perform daily check-in
// @route   POST /api/gamification/checkin
// @access  Private
const dailyCheckIn = asyncHandler(async (req, res) => {
    const result = await gamificationService.updateStreak(req.user._id);

    // Award XP for check-in if updated
    let xpAwarded = 0;
    if (result.updated) {
        xpAwarded = 10; // 10 XP for daily checkin
        await gamificationService.addXP(req.user._id, xpAwarded);
    }

    res.json({
        message: result.updated ? 'Streak updated!' : 'Already checked in today',
        streak: result.streak,
        xpAwarded
    });
});

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
    const leaderboard = await gamificationService.getLeaderboard();
    res.json(leaderboard);
});

module.exports = {
    getStats,
    dailyCheckIn,
    getLeaderboard
};
