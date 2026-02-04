const geminiService = require('../services/geminiService');

/**
 * @route   POST /api/ai/hint
 * @desc    Get a hint for the current code
 * @access  Private
 */
const getHint = async (req, res) => {
    try {
        const { code, language, problem } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const hint = await geminiService.getHint(
            code,
            language || 'python',
            problem,
            userId
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
        const { code, error, language } = req.body;
        const userId = req.user._id.toString();

        if (!code || !error) {
            return res.status(400).json({ message: 'Code and error are required' });
        }

        const explanation = await geminiService.explainError(
            code,
            error,
            language || 'python',
            userId
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
        const { code, language } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const suggestions = await geminiService.suggestOptimizations(
            code,
            language || 'python',
            userId
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
        const { code, language } = req.body;
        const userId = req.user._id.toString();

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const review = await geminiService.reviewCode(
            code,
            language || 'python',
            userId
        );

        res.json({ review, type: 'review' });
    } catch (error) {
        res.status(error.message.includes('Rate limit') ? 429 : 500)
            .json({ message: error.message });
    }
};

module.exports = {
    getHint,
    explainError,
    suggestOptimizations,
    reviewCode
};
