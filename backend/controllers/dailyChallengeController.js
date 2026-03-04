const asyncHandler = require('express-async-handler');
const DailyChallenge = require('../models/DailyChallenge');
const User = require('../models/User');
const gamificationService = require('../services/gamificationService');

// Helper: Get today's date at midnight UTC
const getTodayUTC = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

// @desc    Get today's daily challenge
// @route   GET /api/challenges/today
// @access  Private
const getTodaysChallenge = asyncHandler(async (req, res) => {
    const today = getTodayUTC();

    // Try to find a challenge assigned to today
    let challenge = await DailyChallenge.findOne({ dateActive: today });

    if (!challenge) {
        // Auto-assign: pick challenge based on day-of-year rotation
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const totalChallenges = await DailyChallenge.countDocuments();

        if (totalChallenges === 0) {
            return res.status(404).json({ error: 'No challenges seeded. Run the seed script first.' });
        }

        const challengeIndex = dayOfYear % totalChallenges;
        challenge = await DailyChallenge.findOne({ challengeIndex });

        if (challenge) {
            // Assign today's date
            challenge.dateActive = today;
            await challenge.save();
        }
    }

    if (!challenge) {
        return res.status(404).json({ error: 'No challenge available for today.' });
    }

    // Check if user already completed today's challenge
    const user = await User.findById(req.user._id);
    const alreadyCompleted = user.completedChallenges?.some(
        c => c.challengeId === challenge._id.toString() &&
            new Date(c.completedAt).toDateString() === today.toDateString()
    );

    res.json({
        _id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        starterCode: challenge.starterCode,
        language: challenge.language,
        hints: challenge.hints,
        xpReward: challenge.xpReward,
        alreadyCompleted: !!alreadyCompleted
    });
});

// @desc    Submit challenge solution
// @route   POST /api/challenges/submit
// @access  Private
const submitChallenge = asyncHandler(async (req, res) => {
    const { challengeId, output } = req.body;

    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) {
        res.status(404);
        throw new Error('Challenge not found');
    }

    // Compare output (trim whitespace for fair comparison)
    const expected = challenge.expectedOutput.trim();
    const actual = (output || '').trim();
    const isCorrect = actual === expected;

    if (!isCorrect) {
        return res.json({
            success: false,
            message: '❌ Output does not match. Try again!',
            expected: challenge.expectedOutput,
            actual: output
        });
    }

    // Check if already completed today
    const user = await User.findById(req.user._id);
    const today = getTodayUTC();
    const alreadyCompleted = user.completedChallenges?.some(
        c => c.challengeId === challengeId &&
            new Date(c.completedAt).toDateString() === today.toDateString()
    );

    if (alreadyCompleted) {
        return res.json({
            success: true,
            message: '✅ Correct! (Already completed today)',
            xpAwarded: 0,
            alreadyCompleted: true
        });
    }

    // Award XP with streak bonus
    const streakMultiplier = Math.min(1 + (user.streak?.current || 0) * 0.1, 2.0); // Max 2x
    const xpAwarded = Math.round(challenge.xpReward * streakMultiplier);

    await gamificationService.addXP(req.user._id, xpAwarded);

    // Record completion
    user.completedChallenges.push({
        challengeId: challenge._id.toString(),
        completedAt: new Date(),
        score: 100
    });
    await user.save();

    res.json({
        success: true,
        message: '🎉 Challenge completed!',
        xpAwarded,
        streakMultiplier,
        totalXP: user.xp + xpAwarded
    });
});

// @desc    Get user's challenge history
// @route   GET /api/challenges/history
// @access  Private
const getChallengeHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('completedChallenges');

    const history = user.completedChallenges || [];

    // Get challenge details for each completion
    const challengeIds = [...new Set(history.map(h => h.challengeId))];
    const challenges = await DailyChallenge.find({
        _id: { $in: challengeIds }
    }).select('title difficulty category xpReward');

    const challengeMap = {};
    challenges.forEach(c => { challengeMap[c._id.toString()] = c; });

    const enrichedHistory = history.map(h => ({
        ...h.toObject(),
        challenge: challengeMap[h.challengeId] || null
    })).reverse().slice(0, 30); // Last 30

    res.json({
        total: history.length,
        history: enrichedHistory
    });
});

// @desc    Get 3 tiered challenges for today (easy, medium, hard)
// @route   GET /api/challenges/tiered
// @access  Private
const getTodaysTiered = asyncHandler(async (req, res) => {
    const today = getTodayUTC();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const user = await User.findById(req.user._id).select('completedChallenges');

    const tiers = ['easy', 'medium', 'hard'];
    const results = [];

    for (const difficulty of tiers) {
        const count = await DailyChallenge.countDocuments({ difficulty });
        if (count === 0) { results.push(null); continue; }

        const idx = dayOfYear % count;
        const challenge = await DailyChallenge.findOne({ difficulty }).skip(idx).limit(1);
        if (!challenge) { results.push(null); continue; }

        const alreadyCompleted = user.completedChallenges?.some(
            c => c.challengeId === challenge._id.toString() &&
                new Date(c.completedAt).toDateString() === today.toDateString()
        );

        results.push({
            _id: challenge._id,
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            category: challenge.category,
            starterCode: challenge.starterCode,
            language: challenge.language,
            hints: challenge.hints,
            xpReward: challenge.xpReward,
            alreadyCompleted: !!alreadyCompleted
        });
    }

    res.json({ easy: results[0], medium: results[1], hard: results[2] });
});

// @desc    Replay a specific challenge by ID
// @route   GET /api/challenges/replay/:id
// @access  Private
const replayChallenge = asyncHandler(async (req, res) => {
    const challenge = await DailyChallenge.findById(req.params.id);
    if (!challenge) {
        res.status(404);
        throw new Error('Challenge not found');
    }

    res.json({
        _id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        starterCode: challenge.starterCode,
        language: challenge.language,
        hints: challenge.hints,
        xpReward: challenge.xpReward,
    });
});

module.exports = {
    getTodaysChallenge,
    submitChallenge,
    getChallengeHistory,
    getTodaysTiered,
    replayChallenge
};
