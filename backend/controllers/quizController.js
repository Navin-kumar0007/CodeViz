const CustomQuiz = require('../models/CustomQuiz');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Instructor only)
const createQuiz = async (req, res) => {
    try {
        const { title, description, questions, difficulty, category } = req.body;

        const quiz = await CustomQuiz.create({
            title,
            description,
            questions,
            difficulty,
            category,
            createdBy: req.user._id
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all published quizzes
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const filter = { isPublished: true };

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;

        const quizzes = await CustomQuiz.find(filter)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quizzes created by current instructor
// @route   GET /api/quizzes/my
// @access  Private (Instructor only)
const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await CustomQuiz.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Public (for published) / Private (for unpublished drafts)
const getQuiz = async (req, res) => {
    try {
        const quiz = await CustomQuiz.findById(req.params.id)
            .populate('createdBy', 'name');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Allow access if published or if creator
        if (!quiz.isPublished && (!req.user || !quiz.createdBy._id.equals(req.user._id))) {
            return res.status(403).json({ message: 'Quiz not published yet' });
        }

        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Owner only)
const updateQuiz = async (req, res) => {
    try {
        const quiz = await CustomQuiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check ownership
        if (!quiz.createdBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to edit this quiz' });
        }

        const { title, description, questions, difficulty, category, isPublished } = req.body;

        quiz.title = title || quiz.title;
        quiz.description = description || quiz.description;
        quiz.questions = questions || quiz.questions;
        quiz.difficulty = difficulty || quiz.difficulty;
        quiz.category = category || quiz.category;
        if (typeof isPublished === 'boolean') quiz.isPublished = isPublished;

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Owner only)
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await CustomQuiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check ownership
        if (!quiz.createdBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await quiz.deleteOne();
        res.json({ message: 'Quiz deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record quiz completion
// @route   POST /api/quizzes/:id/complete
// @access  Public
const completeQuiz = async (req, res) => {
    try {
        const { score } = req.body;
        const quiz = await CustomQuiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Update stats
        const newTotal = quiz.timesCompleted + 1;
        quiz.averageScore = ((quiz.averageScore * quiz.timesCompleted) + score) / newTotal;
        quiz.timesCompleted = newTotal;

        await quiz.save();
        res.json({ message: 'Quiz completion recorded', averageScore: quiz.averageScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuiz,
    getQuizzes,
    getMyQuizzes,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    completeQuiz
};
