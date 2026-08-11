/**
 * Plan & entitlement definitions — the single source of truth for what each
 * tier can do and how much. Razorpay plan IDs come from env so the same code
 * works in test and live mode. (Razorpay = India-friendly gateway.)
 */

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    razorpayPlanId: null,
    features: ['visualizer', 'basic-practice', 'community'],
    limits: { executionsPerDay: 40, aiCallsPerDay: 15, seats: 1 },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    razorpayPlanId: process.env.RAZORPAY_PLAN_PRO || null,
    features: [
      'visualizer', 'basic-practice', 'community',
      'ai-mentor', 'interview-prep', 'advanced-courses', 'unlimited-share', 'priority-execution',
    ],
    limits: { executionsPerDay: 500, aiCallsPerDay: 300, seats: 1 },
  },
  team: {
    id: 'team',
    name: 'Team / EDU',
    razorpayPlanId: process.env.RAZORPAY_PLAN_TEAM || null,
    features: [
      'visualizer', 'basic-practice', 'community',
      'ai-mentor', 'interview-prep', 'advanced-courses', 'unlimited-share', 'priority-execution',
      'classrooms', 'analytics', 'sso', 'plagiarism',
    ],
    limits: { executionsPerDay: 1000, aiCallsPerDay: 1000, seats: 30 },
  },
};

const DEFAULT_PLAN = 'free';

/** Resolve a plan definition by id, falling back to free. */
function getPlan(planId) {
  return PLANS[planId] || PLANS[DEFAULT_PLAN];
}

/** Map a Razorpay plan id back to our plan id (for webhook handling). */
function planIdFromRazorpayPlanId(rzPlanId) {
  const match = Object.values(PLANS).find((p) => p.razorpayPlanId && p.razorpayPlanId === rzPlanId);
  return match ? match.id : DEFAULT_PLAN;
}

// Ordering so we can pick the higher of a user's personal plan vs an inherited team plan.
const PLAN_RANK = { free: 0, pro: 1, team: 2 };

module.exports = { PLANS, DEFAULT_PLAN, PLAN_RANK, getPlan, planIdFromRazorpayPlanId };
