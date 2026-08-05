const mongoose = require('mongoose');

/**
 * One subscription record per user. Source of truth for the user's current
 * plan + Stripe linkage. Kept in sync by the Stripe webhook.
 */
const subscriptionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: { type: String, enum: ['free', 'pro', 'team'], default: 'free' },
    status: {
      // Razorpay statuses: created, authenticated, active, pending, halted,
      // cancelled, completed, expired (+ 'none' for never-subscribed).
      type: String,
      default: 'none',
    },
    seats: { type: Number, default: 1 },
    gateway: { type: String, default: 'razorpay' },
    gatewayCustomerId: { type: String, default: null, index: true },
    gatewaySubscriptionId: { type: String, default: null, index: true },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
