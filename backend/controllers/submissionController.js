const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const dockerService = require('../services/dockerService');

// POST /api/submit — run code against all test cases
const submitSolution = async (req, res) => {
    try {
        const { problemId, language, code } = req.body;
        const userId = req.user._id;

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        const testCases = problem.testCases;
        if (!testCases || testCases.length === 0) {
            return res.status(400).json({ error: 'No test cases for this problem' });
        }

        const results = [];
        let allPassed = true;

        for (const tc of testCases) {
            const result = await runSingleTest(code, language, tc.input);

            const actualOutput = (result.output || '').trim();
            const expectedOutput = (tc.expectedOutput || '').trim();
            const passed = actualOutput === expectedOutput;

            if (!passed) allPassed = false;

            results.push({
                passed,
                input: tc.isHidden ? '[hidden]' : tc.input,
                expectedOutput: tc.isHidden ? '[hidden]' : tc.expectedOutput,
                actualOutput: tc.isHidden && !passed ? '[hidden]' : actualOutput
            });

            // Stop on first failure for efficiency
            if (!passed && result.error) {
                // Runtime error or TLE — don't continue
                const verdict = result.timeout ? 'time_limit_exceeded'
                    : result.compilationError ? 'compilation_error'
                        : 'runtime_error';

                const submission = await Submission.create({
                    user: userId, problem: problemId, language, code,
                    verdict,
                    testResults: results,
                    totalTests: testCases.length,
                    passedTests: results.filter(r => r.passed).length
                });

                problem.stats.totalSubmissions += 1;
                await problem.save();

                return res.json({
                    verdict,
                    testResults: results,
                    totalTests: testCases.length,
                    passedTests: results.filter(r => r.passed).length,
                    submissionId: submission._id
                });
            }
        }

        const verdict = allPassed ? 'accepted' : 'wrong_answer';

        const submission = await Submission.create({
            user: userId, problem: problemId, language, code,
            verdict,
            testResults: results,
            totalTests: testCases.length,
            passedTests: results.filter(r => r.passed).length
        });

        problem.stats.totalSubmissions += 1;
        if (allPassed) problem.stats.acceptedSubmissions += 1;
        await problem.save();

        // Award XP for accepted solution
        if (allPassed) {
            try {
                const User = require('../models/User');
                const xpReward = problem.difficulty === 'easy' ? 10 : problem.difficulty === 'medium' ? 25 : 50;
                await User.findByIdAndUpdate(userId, { $inc: { xp: xpReward } });
            } catch (e) { /* ignore XP errors */ }
        }

        res.json({
            verdict,
            testResults: results,
            totalTests: testCases.length,
            passedTests: results.filter(r => r.passed).length,
            submissionId: submission._id
        });
    } catch (err) {
        console.error('submitSolution error:', err);
        res.status(500).json({ error: 'Submission failed' });
    }
};

/**
 * Run code against a single test case input using Docker Sandbox
 */
async function runSingleTest(code, language, input) {
    try {
        const result = await dockerService.runInSandbox(code, language, input);

        // Map dockerService results to the format expected by the controller
        return {
            output: result.output || '',
            error: result.error || '',
            timeout: result.timeout || false,
            exitCode: result.exitCode
        };
    } catch (error) {
        console.error('Sandbox execution error:', error);
        return { error: error.message, output: '' };
    }
}

// GET /api/submissions/:problemId — user's past submissions
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            user: req.user._id,
            problem: req.params.problemId
        }).sort({ createdAt: -1 }).limit(20);
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

// GET /api/submissions/stats — user's overall stats
const getSubmissionStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const total = await Submission.countDocuments({ user: userId });
        const accepted = await Submission.countDocuments({ user: userId, verdict: 'accepted' });
        const uniqueSolved = await Submission.distinct('problem', { user: userId, verdict: 'accepted' });

        // Difficulty breakdown
        const solvedProblems = await Problem.find({ _id: { $in: uniqueSolved } }).select('difficulty');
        const byDifficulty = { easy: 0, medium: 0, hard: 0 };
        solvedProblems.forEach(p => { byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] || 0) + 1; });

        res.json({
            totalSubmissions: total,
            acceptedSubmissions: accepted,
            uniqueSolved: uniqueSolved.length,
            byDifficulty
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

module.exports = { submitSolution, getSubmissions, getSubmissionStats };
