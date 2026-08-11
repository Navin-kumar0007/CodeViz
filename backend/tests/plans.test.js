const { getPlan, planIdFromRazorpayPlanId, PLANS, DEFAULT_PLAN, PLAN_RANK } = require('../config/plans');

describe('plan config', () => {
  test('all three tiers exist with features + limits', () => {
    for (const id of ['free', 'pro', 'team']) {
      expect(PLANS[id]).toBeDefined();
      expect(Array.isArray(PLANS[id].features)).toBe(true);
      expect(typeof PLANS[id].limits.executionsPerDay).toBe('number');
      expect(typeof PLANS[id].limits.aiCallsPerDay).toBe('number');
    }
  });

  test('free lacks premium features; pro/team include ai-mentor', () => {
    expect(getPlan('free').features).not.toContain('ai-mentor');
    expect(getPlan('pro').features).toContain('ai-mentor');
    expect(getPlan('team').features).toContain('classrooms');
  });

  test('limits increase across tiers', () => {
    expect(getPlan('pro').limits.executionsPerDay).toBeGreaterThan(getPlan('free').limits.executionsPerDay);
    expect(getPlan('team').limits.aiCallsPerDay).toBeGreaterThanOrEqual(getPlan('pro').limits.aiCallsPerDay);
  });

  test('unknown plan falls back to free', () => {
    expect(getPlan('nope').id).toBe(DEFAULT_PLAN);
    expect(getPlan(undefined).id).toBe('free');
  });

  test('planIdFromRazorpayPlanId defaults to free for unknown/null', () => {
    expect(planIdFromRazorpayPlanId(null)).toBe('free');
    expect(planIdFromRazorpayPlanId('plan_does_not_exist')).toBe('free');
  });

  // Drives "higher of personal vs inherited team plan" in entitlementService.
  test('PLAN_RANK orders free < pro < team', () => {
    expect(PLAN_RANK.free).toBeLessThan(PLAN_RANK.pro);
    expect(PLAN_RANK.pro).toBeLessThan(PLAN_RANK.team);
    for (const id of Object.keys(PLANS)) expect(typeof PLAN_RANK[id]).toBe('number');
  });
});
