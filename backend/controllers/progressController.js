const LearningProgress = require('../models/LearningProgress');

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
        if (localProgress) {
            for (const [pathId, localData] of Object.entries(localProgress)) {
                const serverData = progress.pathProgress.get(pathId);

                if (!serverData) {
                    // New path, just add it
                    progress.pathProgress.set(pathId, {
                        completed: localData.completed || [],
                        quizScores: new Map(Object.entries(localData.quizScores || {}))
                    });
                } else {
                    // Merge completed lessons (union)
                    const mergedCompleted = [...new Set([
                        ...(serverData.completed || []),
                        ...(localData.completed || [])
                    ])];

                    // Merge quiz scores (keep highest)
                    const mergedScores = new Map(serverData.quizScores || new Map());
                    if (localData.quizScores) {
                        for (const [lessonId, score] of Object.entries(localData.quizScores)) {
                            const serverScore = mergedScores.get(lessonId) || 0;
                            mergedScores.set(lessonId, Math.max(serverScore, score));
                        }
                    }

                    progress.pathProgress.set(pathId, {
                        completed: mergedCompleted,
                        quizScores: mergedScores
                    });
                }
            }
        }

        // Merge achievements (union)
        if (localAchievements) {
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

module.exports = { getProgress, updateProgress, syncProgress };
