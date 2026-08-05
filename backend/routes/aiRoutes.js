const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireFeature, meterUsage } = require('../middleware/billingMiddleware');
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

// All routes require authentication + count against the daily AI-call limit.
router.use(protect);
router.use(meterUsage('aiCalls'));

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

// 🧠 AI Mentor + AI-generated problems (Phase 5). AI-call metering is applied
// router-wide above; mentor features additionally require the 'ai-mentor' plan.
const { generateProblem, mentorReview, mentorNext } = require('../controllers/aiMentorController');

router.post('/generate-problem', generateProblem);
router.post('/mentor/review', requireFeature('ai-mentor'), mentorReview);
router.get('/mentor/next', requireFeature('ai-mentor'), mentorNext);

module.exports = router;
