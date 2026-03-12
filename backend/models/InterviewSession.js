const mongoose = require('mongoose');

/**
 * InterviewSession Model
 * Tracks timed mock interview sessions with problem results
 */

const problemResultSchema = mongoose.Schema({
    problemId: { type: String, required: true },
    code: { type: String, default: '' },
    language: { type: String, default: 'python' },
    passed: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 }, // seconds spent on this problem
    testCaseResults: [{
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: { type: Boolean, default: false }
    }],
    score: { type: Number, default: 0 } // 0-100
});

const interviewSessionSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        mode: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'mixed'],
            required: true
        },
        problems: [{ type: String }], // array of problemIds
        results: [problemResultSchema],
        timeLimit: {
            type: Number,
            required: true // in minutes (30, 45, 60)
        },
        startedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'abandoned'],
            default: 'active'
        },
        totalScore: {
            type: Number,
            default: 0 // 0-100 overall
        },
        rating: {
            type: String,
            enum: ['needs_practice', 'getting_there', 'solid', 'excellent', 'interview_ready'],
            default: 'needs_practice'
        }
    },
    { timestamps: true }
);

// Index for fast user history lookups
interviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
