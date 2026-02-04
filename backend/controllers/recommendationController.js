const recommendationService = require('../services/recommendationService');

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized learning recommendations
 * @access  Private
 */
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const recommendations = await recommendationService.getRecommendations(userId);

        res.json(recommendations);
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: 'Failed to get recommendations' });
    }
};

/**
 * @route   GET /api/recommendations/difficulty
 * @desc    Get user's current difficulty level
 * @access  Private
 */
const getDifficulty = async (req, res) => {
    try {
        const userId = req.user._id;
        const difficulty = await recommendationService.getUserDifficulty(userId);

        res.json({ difficulty });
    } catch (error) {
        console.error('Get difficulty error:', error);
        res.status(500).json({ message: 'Failed to get difficulty level' });
    }
};

/**
 * @route   GET /api/recommendations/weak-areas
 * @desc    Get user's weak areas from quiz performance
 * @access  Private
 */
const getWeakAreas = async (req, res) => {
    try {
        const userId = req.user._id;
        const recommendations = await recommendationService.getRecommendations(userId);

        res.json({
            weakAreas: recommendations.weakAreas,
            strongAreas: recommendations.strongAreas
        });
    } catch (error) {
        console.error('Get weak areas error:', error);
        res.status(500).json({ message: 'Failed to get weak areas' });
    }
};

module.exports = {
    getRecommendations,
    getDifficulty,
    getWeakAreas
};
