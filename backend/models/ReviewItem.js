const mongoose = require('mongoose');

// Spaced-repetition record: one row per (user, problem). Solved problems enter the
// review queue and resurface on a decay curve (SM-2 lite); a lapse (getting it wrong
// again during review) shortens the interval so it comes back sooner. `dueAt` drives
// the "due today" queue on the dashboard.
const reviewItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    ease: { type: Number, default: 2.3 },        // multiplier for the next interval (clamped 1.3–2.8)
    intervalDays: { type: Number, default: 0 },  // current spacing in days
    reps: { type: Number, default: 0 },          // consecutive successful reviews
    lapses: { type: Number, default: 0 },        // times it was forgotten / failed in review
    dueAt: { type: Date, default: Date.now, index: true },
    lastGrade: { type: String, enum: ['again', 'hard', 'good', 'easy'], default: 'good' },
    lastReviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

reviewItemSchema.index({ user: 1, problem: 1 }, { unique: true });
reviewItemSchema.index({ user: 1, dueAt: 1 }); // "what's due" query

module.exports = mongoose.model('ReviewItem', reviewItemSchema);
