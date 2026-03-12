const asyncHandler = require('express-async-handler');
const { compareAll } = require('../services/plagiarismService');

/**
 * 🔍 Plagiarism Detection Controller
 * Analyzes assignment submissions for code similarity
 */

// POST /api/plagiarism/check — Run plagiarism check on provided submissions
const checkPlagiarism = asyncHandler(async (req, res) => {
    const { submissions, assignmentTitle } = req.body;

    // submissions: [{ studentId, studentName, code }]
    if (!submissions || !Array.isArray(submissions) || submissions.length < 2) {
        res.status(400);
        throw new Error('Need at least 2 submissions to compare');
    }

    // Only instructors and admins can run plagiarism checks
    if (!['instructor', 'admin'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Only instructors and admins can run plagiarism checks');
    }

    const results = compareAll(submissions);

    res.json({
        assignmentTitle: assignmentTitle || 'Untitled Assignment',
        checkedAt: new Date(),
        ...results
    });
});

// POST /api/plagiarism/compare — Compare exactly two code snippets
const compareTwoSubmissions = asyncHandler(async (req, res) => {
    const { code1, code2 } = req.body;
    if (!code1 || !code2) {
        res.status(400);
        throw new Error('Both code1 and code2 are required');
    }

    const { compareTwo } = require('../services/plagiarismService');
    const result = compareTwo(code1, code2);

    res.json(result);
});

module.exports = { checkPlagiarism, compareTwoSubmissions };
