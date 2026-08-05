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
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'none'],
      default: 'none',
    },
    seats: { type: Number, default: 1 },
    stripeCustomerId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
