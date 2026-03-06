const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    category: { type: String, required: true },
    companyTags: [String],
    description: { type: String, required: true },
    constraints: [String],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false }
    }],
    starterCode: {
        python: String,
        javascript: String,
        java: String,
        cpp: String,
        typescript: String,
        go: String,
        c: String
    },
    hints: [String],
    solution: {
        code: {
            python: String,
            javascript: String
        },
        explanation: String,
        timeComplexity: String,
        spaceComplexity: String
    },
    stats: {
        totalSubmissions: { type: Number, default: 0 },
        acceptedSubmissions: { type: Number, default: 0 }
    },
    order: { type: Number, default: 0 }
}, { timestamps: true });

problemSchema.virtual('acceptanceRate').get(function () {
    if (this.stats.totalSubmissions === 0) return 0;
    return Math.round((this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100);
});

problemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Problem', problemSchema);
