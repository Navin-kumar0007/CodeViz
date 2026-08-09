const Subscription = require('../models/Subscription');
const UsageMeter = require('../models/UsageMeter');
const { getPlan, DEFAULT_PLAN, PLANS } = require('../config/plans');

// Staff (instructor/admin) are superusers: every feature, no daily limits.
const STAFF_ROLES = new Set(['admin', 'instructor']);
const ALL_FEATURES = [...new Set(Object.values(PLANS).flatMap((p) => p.features))];
const UNLIMITED = 1000000;

/**
 * Resolve a user's active plan id. A subscription counts as entitled only when
 * its status is active/trialing; otherwise the user falls back to free.
 */
async function getActivePlanId(userId) {
  const sub = await Subscription.findOne({ user: userId }).lean();
  if (!sub) return DEFAULT_PLAN;
  const entitled = ['active', 'trialing'].includes(sub.status);
  return entitled ? sub.plan : DEFAULT_PLAN;
}

/** Full entitlement snapshot: plan, features, limits, and today's usage. */
async function getEntitlements(userId, role) {
  if (STAFF_ROLES.has(role)) {
    return {
      plan: 'staff', planName: 'Staff — unlimited', staff: true,
      features: ALL_FEATURES,
      limits: { executionsPerDay: UNLIMITED, aiCallsPerDay: UNLIMITED, seats: UNLIMITED },
      usage: { executions: 0, aiCalls: 0 },
    };
  }
  const planId = await getActivePlanId(userId);
  const plan = getPlan(planId);
  const usage = await UsageMeter.findOne({ user: userId, day: UsageMeter.today() }).lean();
  return {
    plan: plan.id,
    planName: plan.name,
    features: plan.features,
    limits: plan.limits,
    usage: { executions: usage?.executions || 0, aiCalls: usage?.aiCalls || 0 },
  };
}

async function hasFeature(userId, feature) {
  const planId = await getActivePlanId(userId);
  return getPlan(planId).features.includes(feature);
}

/**
 * Atomically increment a usage counter, enforcing the plan's daily limit.
 * Returns { allowed, used, limit }. When over the limit, nothing is consumed.
 * `field` is 'executions' or 'aiCalls'.
 */
async function consumeUsage(userId, field) {
  const planId = await getActivePlanId(userId);
  const limit = getPlan(planId).limits[field === 'executions' ? 'executionsPerDay' : 'aiCallsPerDay'];
  const day = UsageMeter.today();

  // Atomic conditional increment: only bump if still under the limit.
  const updated = await UsageMeter.findOneAndUpdate(
    { user: userId, day, [field]: { $lt: limit } },
    { $inc: { [field]: 1 } },
    { new: true, upsert: false }
  );

  if (updated) return { allowed: true, used: updated[field], limit };

  // Either at/over limit, or no doc yet — create one at 1 if none exists.
  const existing = await UsageMeter.findOne({ user: userId, day });
  if (!existing) {
    const created = await UsageMeter.create({ user: userId, day, [field]: 1 });
    return { allowed: true, used: created[field], limit };
  }
  return { allowed: false, used: existing[field], limit };
}

module.exports = { getActivePlanId, getEntitlements, hasFeature, consumeUsage, STAFF_ROLES };
