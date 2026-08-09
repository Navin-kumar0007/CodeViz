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
        let solved = false;
        if (req.user?._id) {
            const accepted = await Submission.findOne({
                user: req.user._id, problem: problem._id, verdict: 'accepted'
            });
            solved = !!accepted;
            visible.solved = solved;
        }

        // Gate the editorial: full content only once solved (or for staff).
        // Otherwise expose just its availability so the UI can offer a spoiler unlock.
        const isStaff = ['instructor', 'admin'].includes(req.user?.role);
        visible.hasEditorial = !!problem.editorial;
        if (problem.editorial && !solved && !isStaff) {
            visible.editorial = null;
            visible.editorialLocked = true;
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

// POST /api/problems/:slug/editorial/generate  (admin) — AI editorial + topics.
const generateEditorial = async (req, res) => {
    try {
        if (!['instructor', 'admin'].includes(req.user?.role)) return res.status(403).json({ error: 'Staff access required' });
        const problem = await Problem.findOne({ slug: req.params.slug });
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        const aiMentorService = require('../services/aiMentorService');
        const editorial = await aiMentorService.generateEditorial({ problem });
        problem.editorial = editorial;
        if (editorial.topics?.length && (!problem.topics || problem.topics.length === 0)) problem.topics = editorial.topics;
        await problem.save();
        res.status(201).json({ slug: problem.slug, editorial });
    } catch (err) {
        res.status(502).json({ error: `Editorial generation failed: ${err.message}` });
    }
};

// DELETE /api/problems/:slug  (admin) — remove a problem.
const deleteProblem = async (req, res) => {
    try {
        if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        const r = await Problem.findOneAndDelete({ slug: req.params.slug });
        if (!r) return res.status(404).json({ error: 'Problem not found' });
        res.json({ message: 'Problem deleted', slug: req.params.slug });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};

module.exports = { getProblems, getProblem, createProblem, getRandomProblem, generateEditorial, deleteProblem };
