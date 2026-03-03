const mongoose = require('mongoose');

const dailyChallengeSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    category: {
        type: String,
        enum: ['arrays', 'strings', 'sorting', 'searching', 'stacks', 'linked-lists', 'math', 'recursion'],
        required: true
    },
    starterCode: { type: String, required: true },
    language: { type: String, default: 'python' },
    expectedOutput: { type: String, required: true },
    hints: [{ type: String }],
    xpReward: { type: Number, default: 25 },
    dateActive: { type: Date, index: true },
    challengeIndex: { type: Number, unique: true }, // rotating index (0-29)
}, { timestamps: true });

// Index for fast daily lookup
dailyChallengeSchema.index({ dateActive: 1 });

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
