const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const VideoLesson = require('../models/VideoLesson');

/**
 * 📊 Progress Reports Controller
 * Generates weekly analytics, recommendations, and streak data
 */

// GET /api/reports/weekly — Weekly progress summary
const getWeeklyReport = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch user
    const user = await User.findById(userId).select('name xp streak streakHistory progressStats');

    // Interview sessions this week
    const weekSessions = await InterviewSession.find({
        userId,
        status: 'completed',
        completedAt: { $gte: oneWeekAgo }
    }).sort({ completedAt: -1 });

    // All-time sessions for trend
    const allSessions = await InterviewSession.find({
        userId,
        status: 'completed'
    }).sort({ completedAt: -1 }).limit(30);

    // Videos completed this week
    const videosCompleted = await VideoLesson.countDocuments({
        completedBy: userId,
        updatedAt: { $gte: oneWeekAgo }
    });

    // Calculate weekly stats
    const weekProblems = weekSessions.reduce((sum, s) => sum + s.results.length, 0);
    const weekSolved = weekSessions.reduce((sum, s) => sum + s.results.filter(r => r.passed).length, 0);
    const weekAvgScore = weekSessions.length > 0
        ? Math.round(weekSessions.reduce((s, x) => s + x.totalScore, 0) / weekSessions.length)
        : 0;

    // Category breakdown
    const { getProblemById } = require('../data/interviewProblems');
    const categoryStats = {};
    for (const session of allSessions) {
        for (const result of session.results) {
            const prob = getProblemById(result.problemId);
            if (prob) {
                if (!categoryStats[prob.category]) {
                    categoryStats[prob.category] = { attempted: 0, solved: 0 };
                }
                categoryStats[prob.category].attempted++;
                if (result.passed) categoryStats[prob.category].solved++;
            }
        }
    }

    // Identify weak areas (< 50% solve rate with at least 2 attempts)
    const weakAreas = Object.entries(categoryStats)
        .filter(([, data]) => data.attempted >= 2 && (data.solved / data.attempted) < 0.5)
        .map(([cat, data]) => ({
            category: cat.replace('_', ' '),
            solveRate: Math.round((data.solved / data.attempted) * 100),
            attempted: data.attempted
        }));

    // Recommendations
    const recommendations = [];
    if (weekSessions.length < 2) {
        recommendations.push({ type: 'practice', text: 'Try to complete at least 2 interview sessions this week' });
    }
    weakAreas.forEach(w => {
        recommendations.push({ type: 'improve', text: `Focus on ${w.category} problems (${w.solveRate}% solve rate)` });
    });
    if (videosCompleted === 0) {
        recommendations.push({ type: 'learn', text: 'Watch at least one video lesson to reinforce concepts' });
    }
    if (!recommendations.length) {
        recommendations.push({ type: 'keep_going', text: 'Great work! Keep your streak alive and try harder problems' });
    }

    // Streak data
    const streak = user?.streak || 0;
    const streakHistory = user?.streakHistory || [];

    // Activity heatmap (last 30 days)
    const heatmap = [];
    for (let d = 29; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayActivity = allSessions.filter(s => {
            const completed = new Date(s.completedAt);
            return completed >= date && completed < nextDay;
        }).length;

        heatmap.push({
            date: date.toISOString().split('T')[0],
            count: dayActivity,
            level: dayActivity === 0 ? 0 : dayActivity === 1 ? 1 : dayActivity <= 3 ? 2 : 3
        });
    }

    // Score trend (last 10 sessions)
    const scoreTrend = allSessions.slice(0, 10).reverse().map(s => ({
        date: s.completedAt,
        score: s.totalScore,
        mode: s.mode
    }));

    res.json({
        user: { name: user?.name, xp: user?.xp, streak },
        thisWeek: {
            sessions: weekSessions.length,
            problemsAttempted: weekProblems,
            problemsSolved: weekSolved,
            avgScore: weekAvgScore,
            videosCompleted
        },
        categoryStats,
        weakAreas,
        recommendations,
        heatmap,
        scoreTrend,
        generatedAt: new Date()
    });
});

// GET /api/reports/analytics — Detailed analytics
const getAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const sessions = await InterviewSession.find({
        userId, status: 'completed'
    }).sort({ completedAt: -1 });

    // Overall stats
    const totalSessions = sessions.length;
    const totalProblems = sessions.reduce((s, x) => s + x.results.length, 0);
    const totalSolved = sessions.reduce((s, x) => s + x.results.filter(r => r.passed).length, 0);
    const avgScore = totalSessions > 0
        ? Math.round(sessions.reduce((s, x) => s + x.totalScore, 0) / totalSessions)
        : 0;
    const bestScore = totalSessions > 0 ? Math.max(...sessions.map(s => s.totalScore)) : 0;

    // Difficulty breakdown
    const { getProblemById } = require('../data/interviewProblems');
    const difficultyStats = { easy: { attempted: 0, solved: 0 }, medium: { attempted: 0, solved: 0 }, hard: { attempted: 0, solved: 0 } };
    for (const s of sessions) {
        for (const r of s.results) {
            const p = getProblemById(r.problemId);
            if (p && difficultyStats[p.difficulty]) {
                difficultyStats[p.difficulty].attempted++;
                if (r.passed) difficultyStats[p.difficulty].solved++;
            }
        }
    }

    // Time spent
    const totalMinutes = sessions.reduce((s, x) => {
        if (x.completedAt && x.startedAt) {
            return s + Math.round((new Date(x.completedAt) - new Date(x.startedAt)) / 60000);
        }
        return s;
    }, 0);

    // Rating distribution
    const ratingDist = {};
    sessions.forEach(s => {
        ratingDist[s.rating] = (ratingDist[s.rating] || 0) + 1;
    });

    res.json({
        overview: { totalSessions, totalProblems, totalSolved, avgScore, bestScore, totalMinutes },
        difficultyStats,
        ratingDistribution: ratingDist,
        currentRating: sessions.length > 0 ? sessions[0].rating : 'needs_practice'
    });
});

module.exports = { getWeeklyReport, getAnalytics };
