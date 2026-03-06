const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

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

// Run code against a single test case input
function runSingleTest(code, language, input) {
    return new Promise((resolve) => {
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const timestamp = Date.now() + '_' + Math.random().toString(36).slice(2);
        let command, tempFile, cleanupFiles = [];

        // Wrap code to read from stdin
        switch (language) {
            case 'python':
                tempFile = path.join(tempDir, `sub_${timestamp}.py`);
                fs.writeFileSync(tempFile, code);
                command = `echo ${JSON.stringify(input)} | python3 "${tempFile}"`;
                cleanupFiles.push(tempFile);
                break;

            case 'javascript':
                tempFile = path.join(tempDir, `sub_${timestamp}.js`);
                fs.writeFileSync(tempFile, code);
                command = `echo ${JSON.stringify(input)} | node "${tempFile}"`;
                cleanupFiles.push(tempFile);
                break;

            case 'cpp':
                tempFile = path.join(tempDir, `sub_${timestamp}.cpp`);
                const cppOut = path.join(tempDir, `sub_${timestamp}.out`);
                fs.writeFileSync(tempFile, code);
                command = `g++ "${tempFile}" -o "${cppOut}" 2>&1 && echo ${JSON.stringify(input)} | "${cppOut}"`;
                cleanupFiles.push(tempFile, cppOut);
                break;

            case 'java': {
                const jDir = path.join(tempDir, `java_sub_${timestamp}`);
                if (!fs.existsSync(jDir)) fs.mkdirSync(jDir);
                let jCode = code;
                if (!/class\s+Main/.test(jCode)) jCode = jCode.replace(/class\s+\w+/, 'class Main');
                tempFile = path.join(jDir, 'Main.java');
                fs.writeFileSync(tempFile, jCode);
                command = `javac "${tempFile}" 2>&1 && echo ${JSON.stringify(input)} | java -cp "${jDir}" Main`;
                cleanupFiles.push(jDir);
                break;
            }

            case 'c':
                tempFile = path.join(tempDir, `sub_${timestamp}.c`);
                const cOut = path.join(tempDir, `sub_${timestamp}_c.out`);
                fs.writeFileSync(tempFile, code);
                command = `gcc "${tempFile}" -o "${cOut}" 2>&1 && echo ${JSON.stringify(input)} | "${cOut}"`;
                cleanupFiles.push(tempFile, cOut);
                break;

            case 'typescript':
                tempFile = path.join(tempDir, `sub_${timestamp}.ts`);
                fs.writeFileSync(tempFile, code);
                command = `echo ${JSON.stringify(input)} | npx ts-node "${tempFile}"`;
                cleanupFiles.push(tempFile);
                break;

            case 'go':
                tempFile = path.join(tempDir, `sub_${timestamp}.go`);
                fs.writeFileSync(tempFile, code);
                command = `echo ${JSON.stringify(input)} | go run "${tempFile}"`;
                cleanupFiles.push(tempFile);
                break;

            default:
                return resolve({ error: `Unsupported language: ${language}` });
        }

        exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
            // Cleanup
            cleanupFiles.forEach(f => {
                try {
                    if (fs.existsSync(f)) {
                        if (fs.statSync(f).isDirectory()) fs.rmSync(f, { recursive: true, force: true });
                        else fs.unlinkSync(f);
                    }
                } catch (e) { /* ignore */ }
            });

            if (error) {
                if (error.killed) return resolve({ error: 'TLE', timeout: true, output: '' });
                const isCompileErr = stderr && (stderr.includes('error:') || stderr.includes('Error'));
                return resolve({
                    error: stderr || error.message,
                    compilationError: isCompileErr,
                    output: stdout || ''
                });
            }

            resolve({ output: stdout, error: null });
        });
    });
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
