const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User');

// @desc    Get leaderboard (top users by score)
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const leaderboard = await LearningProgress.find()
            .sort({ totalScore: -1, lessonsCompleted: -1 })
            .limit(limit)
            .populate('userId', 'name email');

        const formatted = leaderboard.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId?._id,
            name: entry.userId?.name || 'Anonymous',
            lessonsCompleted: entry.lessonsCompleted,
            totalScore: entry.totalScore,
            achievementCount: entry.achievements?.length || 0
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's rank
// @route   GET /api/leaderboard/rank/:userId
// @access  Public
const getUserRank = async (req, res) => {
    try {
        const userProgress = await LearningProgress.findOne({ userId: req.params.userId });
        if (!userProgress) {
            return res.json({ rank: null, lessonsCompleted: 0, totalScore: 0 });
        }

        const higherRanked = await LearningProgress.countDocuments({
            totalScore: { $gt: userProgress.totalScore }
        });

        res.json({
            rank: higherRanked + 1,
            lessonsCompleted: userProgress.lessonsCompleted,
            totalScore: userProgress.totalScore,
            achievementCount: userProgress.achievements?.length || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Weekly Sprint leaderboard — score earned this week
// @route   GET /api/leaderboard/weekly
// @access  Public
const getWeeklyLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        // Get start of current week (Monday)
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);

        const leaders = await LearningProgress.find({ updatedAt: { $gte: weekStart } })
            .sort({ totalScore: -1 })
            .limit(limit)
            .populate('userId', 'name');

        const formatted = leaders.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId?._id,
            name: entry.userId?.name || 'Anonymous',
            xp: entry.totalScore || 0,
            level: Math.floor((entry.totalScore || 0) / 100) + 1
        }));

        // Calculate time until next Monday reset
        const nextWeek = new Date(weekStart);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const resetsIn = nextWeek - new Date();

        res.json({ leaders: formatted, resetsInMs: Math.max(0, resetsIn) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Skill-specific leaderboard by challenge category
// @route   GET /api/leaderboard/skill/:category
// @access  Public
const getSkillLeaderboard = async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        // Find users who completed challenges in this category
        const users = await User.find({ 'completedChallenges': { $exists: true } })
            .select('name completedChallenges');

        const DailyChallenge = require('../models/DailyChallenge');
        const categoryChallenges = await DailyChallenge.find({ category }).select('_id');
        const catIds = new Set(categoryChallenges.map(c => c._id.toString()));

        const ranked = users.map(u => {
            const count = (u.completedChallenges || []).filter(
                c => catIds.has(c.challengeId?.toString?.() || c.challengeId)
            ).length;
            return { userId: u._id, name: u.name, completedCount: count };
        }).filter(u => u.completedCount > 0)
            .sort((a, b) => b.completedCount - a.completedCount)
            .slice(0, limit)
            .map((u, i) => ({ ...u, rank: i + 1 }));

        res.json(ranked);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeaderboard, getUserRank, getWeeklyLeaderboard, getSkillLeaderboard };
