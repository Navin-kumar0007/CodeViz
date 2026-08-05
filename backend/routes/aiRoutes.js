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
    translateCode,
    narrateCode,
    detectAI,
    ghostHint,
    socraticTutor
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
router.post('/narrate', narrateCode);
router.post('/detect', detectAI); // 🕵️ AI Detection Route
router.post('/tutor', socraticTutor); // 🤖 Socratic Tutor
router.post('/ghost-hint', ghostHint); // 👻 Ghost Hint

// 🤖 Rubric-based code review
router.post('/rubric-review', rubricReview);
router.get('/review-history', getReviewHistory);

// 🧪 Test case generator
router.post('/generate-tests', generateTestCases);

// 🌐 Code translator
router.post('/translate', translateCode);

// 🧠 AI Mentor + AI-generated problems (Phase 5) — plan-gated / metered
const { generateProblem, mentorReview, mentorNext } = require('../controllers/aiMentorController');
const { requireFeature, meterUsage } = require('../middleware/billingMiddleware');

router.post('/generate-problem', meterUsage('aiCalls'), generateProblem); // metered for everyone
router.post('/mentor/review', requireFeature('ai-mentor'), meterUsage('aiCalls'), mentorReview);
router.get('/mentor/next', requireFeature('ai-mentor'), mentorNext);

module.exports = router;
