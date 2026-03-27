const InterviewSession = require('../models/InterviewSession');
const { getProblems, getProblemById } = require('../data/interviewProblems');
const { protect } = require('../middleware/authMiddleware');
const dockerService = require('../services/dockerService');
const aiService = require('../services/aiService');

/**
 * 🎯 Interview Prep Controller
 * Handles timed mock interviews with curated DSA problems
 */

// POST /api/interview/start — Start a new interview session
const startSession = async (req, res) => {
    try {
        const { mode = 'mixed', problemCount = 4 } = req.body;
        const validModes = ['easy', 'medium', 'hard', 'mixed'];
        if (!validModes.includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode. Use: easy, medium, hard, mixed' });
        }

        // Check for existing active session
        const existing = await InterviewSession.findOne({
            userId: req.user._id,
            status: 'active'
        });
        if (existing) {
            // Return existing active session using the dynamic problem objects straight from the DB
            const problems = existing.problems || [];
            return res.json({
                session: existing,
                problems: problems.map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    difficulty: p.difficulty,
                    category: p.category,
                    timeEstimate: p.timeEstimate,
                    companies: p.companies,
                    hints: p.hints,
                    starterCode: p.starterCode,
                    testCases: p.testCases ? p.testCases.map(tc => ({ input: tc.input })) : [] // hide expected output
                })),
                resumed: true
            });
        }

        // Time limits per mode
        const timeLimits = { easy: 30, medium: 45, hard: 60, mixed: 45 };
        const count = Math.min(Math.max(problemCount, 2), 6);

        // Get robust dynamic problems from AI (Fallbacks to static if AI fails)
        console.log(`🤖 Generating ${count} dynamic AI problems for interview...`);
        let selectedProblems = [];
        try {
            selectedProblems = await aiService.generateInterviewProblems(mode, count, req.user._id);
            if (!Array.isArray(selectedProblems) || selectedProblems.length === 0) {
                throw new Error("AI returned empty problems.");
            }
            // Detect mock/placeholder problems — never show these to users
            const isMock = selectedProblems.some(p => 
                String(p.id).startsWith('mock-ai-') || String(p.title).includes('Mock AI Problem')
            );
            if (isMock) {
                console.warn("⚠️ AI returned mock/placeholder problems. Using static problem bank instead.");
                selectedProblems = getProblems(mode, count);
            }
        } catch (e) {
            console.error("AI Problem Generation Failed. Falling back to static problem bank.", e);
            selectedProblems = getProblems(mode, count);
        }

        const session = await InterviewSession.create({
            userId: req.user._id,
            mode,
            problems: selectedProblems, // Store the full objects in the DB
            timeLimit: timeLimits[mode],
            startedAt: new Date(),
            status: 'active'
        });

        res.status(201).json({
            session,
            problems: selectedProblems.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                difficulty: p.difficulty,
                category: p.category,
                timeEstimate: p.timeEstimate,
                companies: p.companies,
                hints: p.hints,
                starterCode: p.starterCode,
                testCases: p.testCases.map(tc => ({ input: tc.input })) // hide expected output
            })),
            resumed: false
        });
    } catch (err) {
        console.error('Interview start error:', err);
        res.status(500).json({ error: 'Failed to start interview session' });
    }
};

// POST /api/interview/submit/:sessionId — Submit solution for a problem
const submitSolution = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { problemId, code, language = 'python', timeTaken = 0 } = req.body;

        const session = await InterviewSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not your session' });
        }
        if (session.status !== 'active') {
            return res.status(400).json({ error: 'Session already completed' });
        }

        // Get the problem data from the dynamic AI array in the session
        const problem = session.problems.find(p => p.id === problemId);
        if (!problem) return res.status(404).json({ error: 'Problem not found in session' });

        // Generate AI test cases dynamically
        let allTestCases = [...problem.testCases];
        try {
            console.log(`🤖 Generating dynamic test cases for problem: ${problem.title}`);
            const dynamicTestCases = await aiService.generateInterviewTestCases(
                `Title: ${problem.title}\nDescription: ${problem.description}\nStarter Code: ${problem.starterCode}\nDifficulty: ${problem.difficulty}`,
                req.user._id
            );
            
            if (dynamicTestCases && Array.isArray(dynamicTestCases) && dynamicTestCases.length > 0) {
                console.log(`✅ Successfully generated ${dynamicTestCases.length} dynamic AI test cases!`);
                // Append the rigorous dynamic AI test cases to the static defaults
                allTestCases = [...allTestCases, ...dynamicTestCases];
            } else {
                console.warn(`⚠️ Warning: AI returned empty dynamic test cases, reverting to static.`);
            }
        } catch (e) {
            console.error(`AI Test Generation failed for interview submission:`, e);
            // Fallback to static testcases silently
        }

        // Extract test boilerplate from starter code
        let testBoilerplate = "";
        if (problem.starterCode.includes("# Test")) {
            testBoilerplate = "\n# Test\n" + problem.starterCode.split("# Test")[1];
        } else if (problem.starterCode.includes("// Test")) {
            testBoilerplate = "\n// Test\n" + problem.starterCode.split("// Test")[1];
        } else if (problem.starterCode.includes("/* Test */")) {
            testBoilerplate = "\n/* Test */\n" + problem.starterCode.split("/* Test */")[1];
        }

        // If candidate removed the test block, intelligently re-inject it so the code actually outputs something
        let executeCode = code;
        if (testBoilerplate && !executeCode.includes("# Test") && !executeCode.includes("// Test") && !executeCode.includes("/* Test */")) {
            executeCode += "\n" + testBoilerplate;
        }

        // Run code against test cases
        const testCaseResults = [];
        let passedCount = 0;

        for (const tc of allTestCases) {
            try {
                // Actually run the candidate's code in the isolated sandbox securely
                const result = await dockerService.runInSandbox(executeCode, language, tc.input);
                
                let actualOutput = (result.output || '').trim();
                const cleanedExpected = String(tc.expectedOutput).replace(/\r\n/g, '\n').trim();
                const cleanedActual = actualOutput.replace(/\r\n/g, '\n').trim();
                
                let passed = cleanedActual === cleanedExpected;
                
                if (result.timeout || (result.error && result.error.includes("Time Limit Exceeded"))) {
                    passed = false;
                    actualOutput = "Time Limit Exceeded (TLE)";
                } else if (result.error && !result.output) {
                    passed = false; 
                    actualOutput = `Runtime Error: ${result.error}`;
                } else if (actualOutput === "") {
                    passed = false;
                    actualOutput = "(No output produced. Check your print/console.log statements)";
                }

                testCaseResults.push({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: actualOutput,
                    passed: passed
                });
                
                if (passed) passedCount++;
            } catch (err) {
                testCaseResults.push({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: 'Execution Error: ' + err.message,
                    passed: false
                });
            }
        }

        // Calculate score for this problem against ALL test cases
        const score = Math.round((passedCount / allTestCases.length) * 100);

        // Check if already submitted for this problem (update if so)
        const existingIdx = session.results.findIndex(r => r.problemId === problemId);
        const result = {
            problemId,
            code,
            language,
            passed: passedCount === problem.testCases.length,
            timeTaken,
            testCaseResults,
            score
        };

        if (existingIdx >= 0) {
            session.results[existingIdx] = result;
        } else {
            session.results.push(result);
        }

        await session.save();

        res.json({
            problemId,
            passed: result.passed,
            score,
            testCaseResults: testCaseResults.map((tc, i) => ({
                case: i + 1,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                actualOutput: tc.actualOutput,
                passed: tc.passed
            })),
            submitted: session.results.length,
            total: session.problems.length
        });
    } catch (err) {
        console.error('Submit error:', err);
        res.status(500).json({ error: 'Failed to submit solution' });
    }
};

// POST /api/interview/record-struggle/:sessionId — Track micro-metrics
const recordStruggle = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { problemId, type } = req.body; // type: 'backtrack' or 'execution'

        const session = await InterviewSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const resultIdx = session.results.findIndex(r => r.problemId === problemId);
        if (resultIdx === -1) {
            // Create initial result if not exists
            session.results.push({ problemId, struggleTokens: { backtrackCount: 0, executionFrequency: 0 } });
        }
        
        const result = session.results[resultIdx === -1 ? session.results.length - 1 : resultIdx];
        
        if (type === 'backtrack') {
            result.struggleTokens.backtrackCount += 1;
        } else if (type === 'execution') {
            result.struggleTokens.executionFrequency += 1;
        }

        await session.save();
        res.json({ success: true, struggleTokens: result.struggleTokens });
    } catch (err) {
        res.status(500).json({ error: 'Failed to record struggle token' });
    }
};

// POST /api/interview/end/:sessionId — End session and calculate final score
const endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await InterviewSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not your session' });
        }

        // Calculate total score
        const totalProblems = session.problems.length;
        const results = session.results;
        const solvedCount = results.filter(r => r.passed).length;
        const avgScore = results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalProblems)
            : 0;

        // Calculate rating
        let rating;
        if (avgScore >= 90) rating = 'interview_ready';
        else if (avgScore >= 75) rating = 'excellent';
        else if (avgScore >= 60) rating = 'solid';
        else if (avgScore >= 40) rating = 'getting_there';
        else rating = 'needs_practice';

        session.status = 'completed';
        session.completedAt = new Date();
        session.totalScore = avgScore;
        session.rating = rating;

        // 🧠 AI INTUITION SCORING (NEW UPGRADE)
        try {
            const aiService = require('../services/aiService');
            for (const resultItem of session.results) {
                const analysis = await aiService.analyzeIntuition(
                    resultItem.code, 
                    resultItem.struggleTokens, 
                    resultItem.timeTaken,
                    session.userId.toString() // 🔥 Pass userId for rate limiting
                );
                resultItem.intuitionScore = analysis.score;
                resultItem.aiAnalysis = analysis.feedback;
            }
        } catch (aiErr) {
            console.error('AI Intuition Scoring failed:', aiErr);
        }

        await session.save();

        // Calculate time breakdown
        const totalTime = Math.round((session.completedAt - session.startedAt) / 1000 / 60); // minutes
        const categoryBreakdown = {};
        for (const r of results) {
            // Look up problem from session's dynamic array instead of static bank
            const prob = session.problems.find(p => p.id === r.problemId);
            if (prob) {
                const cat = prob.category || 'unknown';
                if (!categoryBreakdown[cat]) {
                    categoryBreakdown[cat] = { solved: 0, total: 0 };
                }
                categoryBreakdown[cat].total++;
                if (r.passed) categoryBreakdown[cat].solved++;
            }
        }

        res.json({
            sessionId: session._id,
            mode: session.mode,
            totalScore: avgScore,
            rating,
            solved: solvedCount,
            total: totalProblems,
            timeUsed: totalTime,
            timeLimit: session.timeLimit,
            categoryBreakdown,
            results: results.map(r => {
                const prob = session.problems.find(p => p.id === r.problemId);
                return {
                    problemId: r.problemId,
                    title: prob?.title || 'Unknown Problem',
                    difficulty: prob?.difficulty || 'unknown',
                    category: prob?.category || 'unknown',
                    passed: r.passed,
                    score: r.score,
                    timeTaken: r.timeTaken
                };
            })
        });
    } catch (err) {
        console.error('End session error:', err);
        res.status(500).json({ error: 'Failed to end session' });
    }
};

// GET /api/interview/history — User's past sessions
const getHistory = async (req, res) => {
    try {
        const sessions = await InterviewSession.find({
            userId: req.user._id,
            status: { $in: ['completed', 'abandoned'] }
        })
            .sort({ completedAt: -1 })
            .limit(20)
            .select('mode totalScore rating status startedAt completedAt problems results timeLimit');

        const history = sessions.map(s => ({
            id: s._id,
            mode: s.mode,
            totalScore: s.totalScore,
            rating: s.rating,
            status: s.status,
            date: s.completedAt || s.startedAt,
            problemCount: s.problems.length,
            solvedCount: s.results.filter(r => r.passed).length,
            timeLimit: s.timeLimit,
            timeUsed: s.completedAt
                ? Math.round((s.completedAt - s.startedAt) / 1000 / 60)
                : null
        }));

        res.json(history);
    } catch (err) {
        console.error('History error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

// GET /api/interview/stats — Aggregate performance stats
const getStats = async (req, res) => {
    try {
        const sessions = await InterviewSession.find({
            userId: req.user._id,
            status: 'completed'
        }).sort({ completedAt: -1 });

        if (sessions.length === 0) {
            return res.json({
                totalSessions: 0,
                avgScore: 0,
                bestScore: 0,
                totalProblems: 0,
                totalSolved: 0,
                categoryStats: {},
                recentScores: [],
                currentRating: 'needs_practice',
                improvement: 0
            });
        }

        const totalSessions = sessions.length;
        const scores = sessions.map(s => s.totalScore);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalSessions);
        const bestScore = Math.max(...scores);

        // Category stats
        const categoryStats = {};
        let totalProblems = 0;
        let totalSolved = 0;

        for (const sess of sessions) {
            for (const result of sess.results) {
                // Look up problem from session's dynamic array
                const prob = sess.problems.find(p => p.id === result.problemId);
                const cat = prob?.category || 'unknown';
                if (!categoryStats[cat]) {
                    categoryStats[cat] = { attempted: 0, solved: 0, avgScore: 0, totalScore: 0 };
                }
                categoryStats[cat].attempted++;
                categoryStats[cat].totalScore += result.score || 0;
                if (result.passed) {
                    categoryStats[cat].solved++;
                    totalSolved++;
                }
                totalProblems++;
            }
        }

        // Calculate avg score per category
        Object.keys(categoryStats).forEach(cat => {
            categoryStats[cat].avgScore = Math.round(
                categoryStats[cat].totalScore / categoryStats[cat].attempted
            );
            delete categoryStats[cat].totalScore;
        });

        // Recent scores for trend chart (last 10)
        const recentScores = sessions.slice(0, 10).reverse().map(s => ({
            date: s.completedAt,
            score: s.totalScore,
            mode: s.mode
        }));

        // Improvement (last 5 avg vs first 5 avg)
        let improvement = 0;
        if (sessions.length >= 4) {
            const recent = sessions.slice(0, Math.ceil(sessions.length / 2));
            const older = sessions.slice(Math.ceil(sessions.length / 2));
            const recentAvg = recent.reduce((s, r) => s + r.totalScore, 0) / recent.length;
            const olderAvg = older.reduce((s, r) => s + r.totalScore, 0) / older.length;
            improvement = Math.round(recentAvg - olderAvg);
        }

        res.json({
            totalSessions,
            avgScore,
            bestScore,
            totalProblems,
            totalSolved,
            categoryStats,
            recentScores,
            currentRating: sessions[0].rating,
            improvement
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// POST /api/interview/session/:sessionId/replay — Save full Proof-of-Work replay
const saveSessionReplay = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { eventLog } = req.body;

        const session = await InterviewSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        // Ensure user is authorized
        if (session.userId && session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not your session' });
        }

        session.eventLog = eventLog;
        await session.save();

        res.json({ success: true, message: 'Proof-of-Work replay saved.' });
    } catch (err) {
        console.error('Save Replay err:', err);
        res.status(500).json({ error: 'Failed to save replay' });
    }
};

module.exports = { startSession, submitSolution, recordStruggle, endSession, getHistory, getStats, saveSessionReplay };
