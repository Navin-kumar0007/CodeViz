const { hasFeature, consumeUsage, STAFF_ROLES } = require('../services/entitlementService');

/**
 * Gate a route behind a plan feature. Usage: router.post('/x', protect,
 * requireFeature('ai-mentor'), handler). Responds 402 when the user's plan
 * lacks the feature.
 */
function requireFeature(feature) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      if (STAFF_ROLES.has(req.user.role)) return next(); // staff bypass plan gates
      if (await hasFeature(req.user._id, feature)) return next();
      return res.status(402).json({
        error: 'upgrade_required',
        feature,
        message: `Your plan doesn't include "${feature}". Upgrade to unlock it.`,
      });
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Meter + limit a resource. `field` is 'executions' or 'aiCalls'. On over-limit
 * responds 429 with the limit so the client can prompt an upgrade.
 */
function meterUsage(field) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      if (STAFF_ROLES.has(req.user.role)) return next(); // staff have no usage limits
      const { allowed, used, limit } = await consumeUsage(req.user._id, field);
      res.set('X-Usage-Used', String(used));
      res.set('X-Usage-Limit', String(limit));
      if (allowed) return next();
      return res.status(429).json({
        error: 'usage_limit_reached',
        field, used, limit,
        message: `Daily ${field} limit reached (${limit}). Upgrade for more.`,
      });
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { requireFeature, meterUsage };
