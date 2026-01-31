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

        const formattedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId?._id,
            name: entry.userId?.name || 'Anonymous',
            lessonsCompleted: entry.lessonsCompleted,
            totalScore: entry.totalScore,
            achievementCount: entry.achievements.length
        }));

        res.json(formattedLeaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's rank
// @route   GET /api/leaderboard/rank/:userId
// @access  Public
const getUserRank = async (req, res) => {
    try {
        const { userId } = req.params;

        const userProgress = await LearningProgress.findOne({ userId });

        if (!userProgress) {
            return res.json({ rank: null, message: 'User has no progress' });
        }

        // Count users with higher score
        const higherRanked = await LearningProgress.countDocuments({
            $or: [
                { totalScore: { $gt: userProgress.totalScore } },
                {
                    totalScore: userProgress.totalScore,
                    lessonsCompleted: { $gt: userProgress.lessonsCompleted }
                }
            ]
        });

        res.json({
            rank: higherRanked + 1,
            lessonsCompleted: userProgress.lessonsCompleted,
            totalScore: userProgress.totalScore,
            achievementCount: userProgress.achievements.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLeaderboard, getUserRank };
