const mongoose = require('mongoose');

const annotationSchema = mongoose.Schema({
    line: { type: Number, required: true },
    type: { type: String, enum: ['improvement', 'warning', 'good', 'critical'], required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
});

const categoryScoreSchema = mongoose.Schema({
    score: { type: Number, min: 0, max: 100, required: true },
    feedback: { type: String, required: true }
});

const codeReviewScoreSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        code: { type: String, required: true },
        language: { type: String, default: 'python' },
        overallScore: { type: Number, min: 0, max: 100, required: true },

        categories: {
            readability: categoryScoreSchema,
            efficiency: categoryScoreSchema,
            bestPractices: categoryScoreSchema,
            errorHandling: categoryScoreSchema,
            codeStructure: categoryScoreSchema
        },

        annotations: [annotationSchema]
    },
    { timestamps: true }
);

// Index for fetching user's score history
codeReviewScoreSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CodeReviewScore', codeReviewScoreSchema);
