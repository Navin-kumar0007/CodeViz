const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    verdict: {
        type: String,
        enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error'],
        required: true
    },
    runtime: { type: Number, default: 0 }, // ms
    testResults: [{
        passed: Boolean,
        input: String,
        expectedOutput: String,
        actualOutput: String
    }],
    totalTests: { type: Number, default: 0 },
    passedTests: { type: Number, default: 0 }
}, { timestamps: true });

// Index for fast lookups
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
