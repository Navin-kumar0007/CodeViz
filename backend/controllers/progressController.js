const LearningProgress = require('../models/LearningProgress');
const skillTreeService = require('../services/skillTreeService');
const dnaService = require('../services/dnaService');

// @desc    Get user's learning progress
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
    try {
        let progress = await LearningProgress.findOne({ userId: req.user._id });

        if (!progress) {
            // Create new progress record if none exists
            progress = await LearningProgress.create({
                userId: req.user._id,
                pathProgress: {},
                achievements: []
            });
        }

        res.json({
            pathProgress: Object.fromEntries(progress.pathProgress),
            achievements: progress.achievements,
            totalScore: progress.totalScore,
            lessonsCompleted: progress.lessonsCompleted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's skill tree mastery
// @route   GET /api/progress/skill-tree
// @access  Private
const getSkillTree = async (req, res) => {
    try {
        const skillTree = await skillTreeService.getSkillTree(req.user._id);
        res.json(skillTree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's DNA Radar profile
// @route   GET /api/progress/dna
// @access  Private
const getDNA = async (req, res) => {
    try {
        const dna = await dnaService.getStudentDNA(req.user._id);
        res.json(dna);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user's learning progress
// @route   PUT /api/progress
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const { pathProgress, achievements } = req.body;

        let progress = await LearningProgress.findOne({ userId: req.user._id });

        if (!progress) {
            progress = new LearningProgress({
                userId: req.user._id
            });
        }

        // Update path progress
        if (pathProgress) {
            for (const [pathId, data] of Object.entries(pathProgress)) {
                progress.pathProgress.set(pathId, {
                    completed: data.completed || [],
                    quizScores: new Map(Object.entries(data.quizScores || {}))
                });
            }
        }

        // Update achievements
        if (achievements) {
            progress.achievements = achievements;
        }

        // Recalculate cached scores
        progress.calculateTotalScore();

        await progress.save();

        res.json({
            pathProgress: Object.fromEntries(progress.pathProgress),
            achievements: progress.achievements,
            totalScore: progress.totalScore,
            lessonsCompleted: progress.lessonsCompleted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sync localStorage progress with server (merge)
// @route   POST /api/progress/sync
// @access  Private
const syncProgress = async (req, res) => {
    try {
        const { localProgress, localAchievements } = req.body;

        let progress = await LearningProgress.findOne({ userId: req.user._id });

        if (!progress) {
            progress = new LearningProgress({
                userId: req.user._id,
                pathProgress: {},
                achievements: []
            });
        }

        // Merge local progress with server (keep most complete)
        if (localProgress && typeof localProgress === 'object') {
            for (const [pathId, localData] of Object.entries(localProgress)) {
                if (!localData) continue;
                const serverData = progress.pathProgress.get(pathId);

                // 🔒 Quiz scores are server-authoritative — set ONLY by the
                // graded quiz endpoint. Sync merges lesson completion (for
                // cross-device continuity) but never trusts client-sent scores,
                // so the leaderboard can't be inflated by a crafted payload.
                if (!serverData) {
                    // New path — accept completion list only, no scores.
                    progress.pathProgress.set(pathId, {
                        completed: localData.completed || [],
                        quizScores: new Map()
                    });
                } else {
                    // Merge completed lessons (union); keep existing server scores.
                    const mergedCompleted = [...new Set([
                        ...(serverData.completed || []),
                        ...(localData.completed || [])
                    ])];

                    progress.pathProgress.set(pathId, {
                        completed: mergedCompleted,
                        quizScores: serverData.quizScores || new Map()
                    });
                }
            }
        }

        // Merge achievements (union)
        if (localAchievements && Array.isArray(localAchievements)) {
            progress.achievements = [...new Set([
                ...progress.achievements,
                ...localAchievements
            ])];
        }

        // Recalculate cached scores
        progress.calculateTotalScore();

        await progress.save();

        res.json({
            pathProgress: Object.fromEntries(progress.pathProgress),
            achievements: progress.achievements,
            totalScore: progress.totalScore,
            lessonsCompleted: progress.lessonsCompleted,
            synced: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/progress/focus — personalized adaptive plan (weak areas + targeted
// problems + next lesson). "It knows what you don't know."
const getFocus = async (req, res) => {
    try {
        const adaptiveService = require('../services/adaptiveService');
        const plan = await adaptiveService.getFocusPlan(req.user._id);
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReadiness = async (req, res) => {
    try {
        const adaptiveService = require('../services/adaptiveService');
        const readiness = await adaptiveService.computeReadiness(req.user._id);
        res.json(readiness);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProgress, updateProgress, syncProgress, getSkillTree, getDNA, getFocus, getReadiness };
