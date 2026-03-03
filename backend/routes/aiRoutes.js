const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getHint,
    explainError,
    suggestOptimizations,
    reviewCode,
    analyzeComplexity,
    optimizeWithDiff,
    rubricReview,
    getReviewHistory,
    generateTestCases,
    translateCode
} = require('../controllers/aiController');

// All routes require authentication
router.use(protect);

// AI Assistant routes
router.post('/hint', getHint);
router.post('/explain-error', explainError);
router.post('/optimize', suggestOptimizations);
router.post('/review', reviewCode);
router.post('/complexity', analyzeComplexity);
router.post('/optimize-diff', optimizeWithDiff);

// 🤖 Rubric-based code review
router.post('/rubric-review', rubricReview);
router.get('/review-history', getReviewHistory);

// 🧪 Test case generator
router.post('/generate-tests', generateTestCases);

// 🌐 Code translator
router.post('/translate', translateCode);

module.exports = router;
