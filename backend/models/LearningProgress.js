const mongoose = require('mongoose');

const learningProgressSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        pathProgress: {
            type: Map,
            of: {
                completed: [String],  // Array of lesson IDs
                quizScores: {
                    type: Map,
                    of: Number  // lessonId -> score
                }
            },
            default: {}
        },
        achievements: {
            type: [String],  // Array of achievement IDs
            default: []
        },
        totalScore: {
            type: Number,
            default: 0  // Cached for leaderboard (sum of all quiz scores)
        },
        lessonsCompleted: {
            type: Number,
            default: 0  // Cached for leaderboard
        }
    },
    { timestamps: true }
);

// Calculate total score from pathProgress
learningProgressSchema.methods.calculateTotalScore = function () {
    let total = 0;
    let lessons = 0;

    this.pathProgress.forEach((progress) => {
        if (progress.completed) {
            lessons += progress.completed.length;
        }
        if (progress.quizScores) {
            progress.quizScores.forEach((score) => {
                total += score;
            });
        }
    });

    this.totalScore = total;
    this.lessonsCompleted = lessons;
    return { totalScore: total, lessonsCompleted: lessons };
};

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
