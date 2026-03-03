const mongoose = require('mongoose');

const sessionEventSchema = mongoose.Schema({
    timestamp: { type: Number, required: true }, // ms from session start
    type: {
        type: String,
        enum: ['code-change', 'execution', 'cursor-move', 'selection', 'viz-state', 'output', 'error', 'marker'],
        required: true
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
});

const sessionSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, maxlength: 100 },
        description: { type: String, default: '', maxlength: 500 },
        language: { type: String, default: 'python' },

        events: [sessionEventSchema],

        duration: { type: Number, default: 0 }, // total ms
        isPublic: { type: Boolean, default: false },
        shareToken: { type: String, unique: true, sparse: true },
        tags: [{ type: String }],

        metadata: {
            totalKeystrokes: { type: Number, default: 0 },
            totalExecutions: { type: Number, default: 0 },
            finalCode: { type: String, default: '' },
            eventCount: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

// Index for fast lookup
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ shareToken: 1 });

module.exports = mongoose.model('Session', sessionSchema);
