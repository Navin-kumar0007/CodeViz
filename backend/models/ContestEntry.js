const mongoose = require('mongoose');

// One row per (contest, user). Tracks score + which problems were solved and when.
const contestEntrySchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
    solved: [{
      problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      points: Number,
      solvedAt: Date,
    }],
    lastSolveAt: { type: Date, default: null }, // tie-break: earlier finisher ranks higher
  },
  { timestamps: true }
);

contestEntrySchema.index({ contest: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ContestEntry', contestEntrySchema);
