const mongoose = require('mongoose');

const replySchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const discussionSchema = mongoose.Schema(
    {
        // Topic linking (optional — can be standalone or per-lesson)
        lessonId: { type: String, default: 'general' },

        // Thread metadata
        title: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ['general', 'help', 'showcase', 'bug', 'discussion'],
            default: 'general'
        },
        tags: [{ type: String, trim: true }],

        // Author
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        // Content
        content: { type: String, required: true },

        // Engagement
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        views: { type: Number, default: 0 },

        // Replies
        replies: [replySchema],

        // Status
        isPinned: { type: Boolean, default: false },
        isResolved: { type: Boolean, default: false },
        acceptedReplyIdx: { type: Number, default: -1 }, // index into replies[]
    },
    { timestamps: true }
);

// Indexes for fast queries
discussionSchema.index({ lessonId: 1, createdAt: -1 });
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);
