const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

// GET /api/problems — list with filters
const getProblems = async (req, res) => {
    try {
        const { difficulty, category, search, page = 1, limit = 50 } = req.query;
        const filter = {};

        if (difficulty) filter.difficulty = difficulty;
        if (category) filter.category = category;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const problems = await Problem.find(filter)
            .select('title slug difficulty category companyTags stats order')
            .sort({ order: 1, createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        // Get user's solved status
        const userId = req.user?._id;
        let solvedSet = new Set();
        if (userId) {
            const accepted = await Submission.find({ user: userId, verdict: 'accepted' }).select('problem');
            solvedSet = new Set(accepted.map(s => s.problem.toString()));
        }

        const result = problems.map(p => ({
            ...p.toJSON(),
            solved: solvedSet.has(p._id.toString())
        }));

        const total = await Problem.countDocuments(filter);
        const categories = await Problem.distinct('category');

        res.json({ problems: result, total, page: Number(page), categories });
    } catch (err) {
        console.error('getProblems error:', err);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};

// GET /api/problems/:slug — single problem
const getProblem = async (req, res) => {
    try {
        const problem = await Problem.findOne({ slug: req.params.slug });
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        // Hide hidden test cases from response
        const visible = problem.toJSON();
        visible.testCases = visible.testCases.filter(tc => !tc.isHidden);

        // Check if user solved it
        if (req.user?._id) {
            const accepted = await Submission.findOne({
                user: req.user._id, problem: problem._id, verdict: 'accepted'
            });
            visible.solved = !!accepted;
        }

        res.json(visible);
    } catch (err) {
        console.error('getProblem error:', err);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
};

// POST /api/problems — create (admin only)
const createProblem = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const problem = await Problem.create(req.body);
        res.status(201).json(problem);
    } catch (err) {
        console.error('createProblem error:', err);
        res.status(500).json({ error: 'Failed to create problem' });
    }
};

// GET /api/problems/random — random problem
const getRandomProblem = async (req, res) => {
    try {
        const { difficulty } = req.query;
        const filter = difficulty ? { difficulty } : {};
        const count = await Problem.countDocuments(filter);
        const random = Math.floor(Math.random() * count);
        const problem = await Problem.findOne(filter).skip(random).select('slug title difficulty');
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch random problem' });
    }
};

module.exports = { getProblems, getProblem, createProblem, getRandomProblem };
