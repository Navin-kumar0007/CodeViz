const geminiService = require('../services/geminiService');
const CodeReviewScore = require('../models/CodeReviewScore');

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

        const hint = await geminiService.getHint(
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

        const explanation = await geminiService.explainError(
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

        const suggestions = await geminiService.suggestOptimizations(
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

        const review = await geminiService.reviewCode(
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

        const raw = await geminiService.analyzeComplexity(
            code,
            language || 'python',
            userId
        );

        // Parse JSON response from Gemini
        try {
            const analysis = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
            res.json({ analysis, type: 'complexity' });
        } catch {
            res.json({ analysis: { raw }, type: 'complexity' });
        }
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

        const raw = await geminiService.optimizeWithDiff(
            code,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        // Parse JSON response from Gemini
        try {
            const diff = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
            res.json({ diff, type: 'optimize-diff' });
        } catch {
            res.json({ diff: { raw }, type: 'optimize-diff' });
        }
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

        const raw = await geminiService.rubricReview(
            code,
            language || 'python',
            userId,
            skillLevel || req.user.skillLevel || 'beginner',
            teachingStyle || 'standard'
        );

        try {
            const review = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());

            // Save score to database for history tracking
            await CodeReviewScore.create({
                userId: req.user._id,
                code,
                language: language || 'python',
                overallScore: review.overallScore,
                categories: review.categories,
                annotations: review.annotations || []
            });

            res.json({ review, type: 'rubric-review' });
        } catch {
            res.json({ review: { raw }, type: 'rubric-review' });
        }
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

        const raw = await geminiService.generateTests(
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

        const raw = await geminiService.translateCode(
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
    translateCode
};
