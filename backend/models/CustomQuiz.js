const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correct: { type: Number, required: true },  // Index of correct option
    explanation: { type: String, default: '' }
});

const customQuizSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        questions: [questionSchema],
        isPublished: { type: Boolean, default: false },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        category: { type: String, default: 'general' },
        timesCompleted: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model('CustomQuiz', customQuizSchema);
