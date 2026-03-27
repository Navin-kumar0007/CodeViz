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
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
