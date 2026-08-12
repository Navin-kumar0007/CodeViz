const mongoose = require('mongoose');

// A user's in-progress (unsubmitted) code for a problem, per language. One row per
// (user, problem-slug, language), upserted as they type — so drafts follow them
// across devices. Distinct from Submission (which is a graded attempt).
const codeDraftSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: String, required: true }, // problem slug (stable, client-known)
    language: { type: String, required: true },
    code: { type: String, default: '' },
  },
  { timestamps: true }
);

codeDraftSchema.index({ user: 1, problem: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('CodeDraft', codeDraftSchema);
