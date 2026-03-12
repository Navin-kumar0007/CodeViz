const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    line: {
        type: Number,
        default: null // if null, it's a general comment, otherwise inline
    }
}, { timestamps: true });

const peerReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'python'
    },
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    },
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('PeerReview', peerReviewSchema);
