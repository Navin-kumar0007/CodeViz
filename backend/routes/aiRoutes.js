const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getHint,
    explainError,
    suggestOptimizations,
    reviewCode
} = require('../controllers/aiController');

// All routes require authentication
router.use(protect);

// AI Assistant routes
router.post('/hint', getHint);
router.post('/explain-error', explainError);
router.post('/optimize', suggestOptimizations);
router.post('/review', reviewCode);

module.exports = router;
