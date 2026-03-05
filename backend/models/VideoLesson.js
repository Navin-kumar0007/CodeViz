const mongoose = require('mongoose');

const videoLessonSchema = mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        videoUrl: { type: String, required: true }, // YouTube or direct URL
        videoType: { type: String, enum: ['youtube', 'direct', 'embed'], default: 'youtube' },
        duration: { type: Number, default: 0 }, // in seconds

        // Topic linking
        topic: { type: String, required: true }, // matches roadmap topic slug
        category: {
            type: String,
            enum: ['arrays', 'strings', 'linked_lists', 'trees', 'graphs', 'dynamic_programming', 'sorting', 'searching', 'recursion', 'intro', 'other'],
            default: 'other'
        },

        // Ordering
        order: { type: Number, default: 0 },

        // Author
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

        // Engagement
        views: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        // Completion tracking
        completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        // Notes/timestamps
        timestamps: [{
            time: Number,  // seconds
            label: String
        }]
    },
    { timestamps: true }
);

videoLessonSchema.index({ topic: 1, order: 1 });
videoLessonSchema.index({ category: 1 });

module.exports = mongoose.model('VideoLesson', videoLessonSchema);
