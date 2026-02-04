const mongoose = require('mongoose');

const discussionSchema = mongoose.Schema(
    {
        lessonId: { type: String, required: true }, // Links to specific lesson (e.g., 'arrays-intro')
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        replies: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                content: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

// ⚡️ INDEX for Faster Discussion Loading
discussionSchema.index({ lessonId: 1, createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);
