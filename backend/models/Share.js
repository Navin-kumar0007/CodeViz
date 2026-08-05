const mongoose = require('mongoose');

/**
 * A publicly shareable visualization run — the growth loop. Stores the code +
 * (optionally) the captured trace so an embed can replay the animation without
 * re-executing. Referenced by a short public token.
 */
const shareSchema = mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled visualization' },
    language: { type: String, default: 'python' },
    code: { type: String, required: true },
    trace: { type: Array, default: [] }, // captured steps (may be empty)
    output: { type: String, default: '' },
    views: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Share', shareSchema);
