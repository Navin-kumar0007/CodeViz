const mongoose = require('mongoose');

/**
 * Per-user, per-day usage counters for metered resources (code executions,
 * AI calls). One document per user per UTC day. Protects margin and enables
 * usage-based limits/pricing.
 */
const usageMeterSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    day: { type: String, required: true }, // 'YYYY-MM-DD' (UTC)
    executions: { type: Number, default: 0 },
    aiCalls: { type: Number, default: 0 },
  },
  { timestamps: true }
);

usageMeterSchema.index({ user: 1, day: 1 }, { unique: true });

/** Current UTC day key. */
usageMeterSchema.statics.today = function () {
  return new Date().toISOString().slice(0, 10);
};

module.exports = mongoose.model('UsageMeter', usageMeterSchema);
