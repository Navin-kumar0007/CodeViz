const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getRecommendations,
    getDifficulty,
    getWeakAreas
} = require('../controllers/recommendationController');

// All routes require authentication
router.use(protect);

// Recommendation routes
router.get('/', getRecommendations);
router.get('/difficulty', getDifficulty);
router.get('/weak-areas', getWeakAreas);

module.exports = router;
