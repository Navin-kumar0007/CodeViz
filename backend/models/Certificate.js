const mongoose = require('mongoose');

/**
 * 🎓 Certificate Model
 * Verifiable digital credentials for course completion
 */

const certificateSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        courseName: {
            type: String,
            required: true
        },
        credentialId: {
            type: String,
            unique: true,
            required: true
        },
        issueDate: {
            type: Date,
            default: Date.now
        },
        skillData: {
            type: Object, // Stores the final state of the skill tree for this certificate
            default: {}
        },
        type: {
            type: String,
            enum: ['mastery', 'achievement', 'participation'],
            default: 'mastery'
        },
        courseSlug: { type: String, index: true }, // links the credential to a specific course
        score: { type: Number, default: null },    // avg quiz score at issue time
        lessonsCompleted: { type: Number, default: 0 },
        signature: { type: String },                // HMAC over the credential — tamper-evidence
    },
    { timestamps: true }
);

// One certificate per user per course.
certificateSchema.index({ userId: 1, courseSlug: 1 }, { unique: true, partialFilterExpression: { courseSlug: { $type: 'string' } } });

module.exports = mongoose.model('Certificate', certificateSchema);
