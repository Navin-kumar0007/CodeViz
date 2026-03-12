const aiService = require('../services/aiService');
const CodeReviewScore = require('../models/CodeReviewScore');
const workerService = require('../services/workerService');

/**
 * @route   POST /api/ai/hint
 * @desc    Get a hint for the current code
 * @access  Private
 */
const getHint = async (req, res) => {
    try {
        const { code, language, problem, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const hint = await aiService.getHint(
            code,
            language || 'python',
            problem,
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        res.json({ hint, type: 'hint' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/explain-error
 * @desc    Explain an error in simple terms
 * @access  Private
 */
const explainError = async (req, res) => {
    try {
        const { code, error, language, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id.toString();

        if (!code || !error) {
            return res.status(400).json({ message: 'Code and error are required' });
        }

        const explanation = await aiService.explainError(
            code,
            error,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        res.json({ explanation, type: 'error' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/optimize
 * @desc    Suggest code optimizations
 * @access  Private
 */
const suggestOptimizations = async (req, res) => {
    try {
        const { code, language, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const suggestions = await aiService.suggestOptimizations(
            code,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        res.json({ suggestions, type: 'optimize' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/review
 * @desc    Full code review
 * @access  Private
 */
const reviewCode = async (req, res) => {
    try {
        const { code, language, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const review = await aiService.reviewCode(
            code,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        res.json({ review, type: 'review' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/complexity
 * @desc    Analyze algorithm complexity with growth data
 * @access  Private
 */
const analyzeComplexity = async (req, res) => {
    try {
        const { code, language } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const raw = await aiService.analyzeComplexity(
            code,
            language || 'python',
            userId
        );

        // --- Offload to Worker Thread for non-blocking parsing ---
        const analysis = await workerService.parseAiResponse(raw, 'complexity');
        res.json({ analysis, type: 'complexity' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/optimize-diff
 * @desc    Optimize code with structured diff output
 * @access  Private
 */
const optimizeWithDiff = async (req, res) => {
    try {
        const { code, language, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const raw = await aiService.optimizeWithDiff(
            code,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        // --- Offload parsing to worker thread ---
        const diff = await workerService.parseAiResponse(raw, 'optimize-diff');
        res.json({ diff, type: 'optimize-diff' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};
/**
 * @route   POST /api/ai/rubric-review
 * @desc    Rubric-based code review with 0-100 scoring
 * @access  Private
 */
const rubricReview = async (req, res) => {
    try {
        const { code, language, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const raw = await aiService.rubricReview(
            code,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        // --- Offload parsing to worker thread ---
        const review = await workerService.parseAiResponse(raw, 'rubric');

        if (review.overallScore !== undefined) {
            // Save score to database for history tracking
            await CodeReviewScore.create({
                userId: req.user._id,
                code,
                language: language || 'python',
                overallScore: review.overallScore,
                categories: review.categories,
                annotations: review.annotations || []
            });
        }

        res.json({ review, type: 'rubric-review' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   GET /api/ai/review-history
 * @desc    Get user's code review score history
 * @access  Private
 */
const getReviewHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 20;

        const history = await CodeReviewScore.find({ userId })
            .select('overallScore language categories.readability.score categories.efficiency.score categories.bestPractices.score categories.errorHandling.score categories.codeStructure.score createdAt')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ history });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/generate-tests
 * @desc    Generate test cases for a function
 * @access  Private
 */
const generateTestCases = async (req, res) => {
    try {
        const { code, language } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const raw = await aiService.generateTests(
            code,
            language || 'python',
            userId
        );

        try {
            const tests = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
            res.json({ tests, type: 'generate-tests' });
        } catch {
            res.json({ tests: { raw }, type: 'generate-tests' });
        }
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/translate
 * @desc    Translate code between languages
 * @access  Private
 */
const translateCode = async (req, res) => {
    try {
        const { code, sourceLanguage, targetLanguage } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }
        if (!targetLanguage) {
            return res.status(400).json({ message: 'Target language is required' });
        }

        const raw = await aiService.translateCode(
            code,
            sourceLanguage || 'python',
            targetLanguage,
            userId
        );

        try {
            const translation = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
            res.json({ translation, type: 'translate' });
        } catch {
            res.json({ translation: { raw }, type: 'translate' });
        }
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/narrate
 * @desc    Explain code line-by-line
 * @access  Private
 */
const narrateCode = async (req, res) => {
    try {
        const { code, language, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const raw = await aiService.narrateCode(
            code,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        try {
            const narrationData = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
            res.json({ narrationData, type: 'narrate' });
        } catch {
            res.json({ narrationData: { raw }, type: 'narrate' });
        }
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/detect
 * @desc    Detect AI vs Human probability for a piece of code
 * @access  Private
 */
const detectAI = async (req, res) => {
    try {
        const { code, language } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const raw = await aiService.detectAI(
            code,
            language || 'python',
            userId
        );

        try {
            const detection = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
            res.json({ detection, type: 'detect' });
        } catch {
            res.json({ detection: { raw }, type: 'detect' });
        }
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

/**
 * @route   POST /api/ai/ghost-hint
 * @desc    Proactive hint when student is stuck
 */
const ghostHint = async (req, res) => {
    try {
        const { code, language, errors, timeSpent, skillLevel, teachingStyle } = req.body;
        const userId = req.user._id;

        const nudge = await aiService.ghostHint(
            code,
            language || 'python',
            errors || '',
            timeSpent || 0,
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        res.json({ nudge });
    } catch (error) {
        // Ghost hints should be silent/optional, but we'll return 200 with empty nudge if it fails
        console.error("👻 Ghost Hint Error:", error.message);
        res.json({ nudge: null });
    }
};

module.exports = {
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
    ghostHint
};
