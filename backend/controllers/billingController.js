const Subscription = require('../models/Subscription');
const razorpay = require('../services/razorpayService');
const { getEntitlements } = require('../services/entitlementService');
const { PLANS, getPlan, planIdFromRazorpayPlanId } = require('../config/plans');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

/** GET /api/billing/entitlements — current plan, features, limits, usage. */
const entitlements = async (req, res) => {
  const data = await getEntitlements(req.user._id, req.user.role);
  res.json({ ...data, gatewayConfigured: razorpay.isConfigured(), gateway: 'razorpay', plans: publicPlans() });
};

/** Public-safe plan catalogue for the pricing page. */
function publicPlans() {
  return Object.values(PLANS).map((p) => ({
    id: p.id, name: p.name, features: p.features, limits: p.limits, purchasable: Boolean(p.razorpayPlanId),
  }));
}

/**
 * POST /api/billing/checkout { plan } — create a Razorpay subscription and
 * return its hosted checkout URL (short_url) to redirect the user to.
 */
const checkout = async (req, res) => {
  const { plan } = req.body;
  const def = getPlan(plan);
  if (!def || def.id === 'free') return res.status(400).json({ message: 'Choose a paid plan.' });
  if (!def.razorpayPlanId) return res.status(400).json({ message: `Plan "${def.id}" has no configured Razorpay plan.` });
  if (!razorpay.isConfigured()) return res.status(503).json({ message: 'Billing is not configured yet.' });

  try {
    let sub = await Subscription.findOne({ user: req.user._id });
    let customerId = sub?.gatewayCustomerId;
    if (!customerId) {
      const customer = await razorpay.createCustomer({ email: req.user.email, name: req.user.name, userId: req.user._id });
      customerId = customer.id;
    }
    const rzSub = await razorpay.createSubscription({ planId: def.razorpayPlanId, customerId, userId: req.user._id });
    await Subscription.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, gateway: 'razorpay', gatewayCustomerId: customerId, gatewaySubscriptionId: rzSub.id, status: rzSub.status },
      { upsert: true }
    );
    res.json({ url: rzSub.short_url, subscriptionId: rzSub.id });
  } catch (err) {
    console.error('checkout error:', err?.error?.description || err.message);
    res.status(500).json({ message: 'Could not start checkout.' });
  }
};

/** POST /api/billing/cancel — cancel the active subscription (Razorpay has no portal). */
const cancel = async (req, res) => {
  if (!razorpay.isConfigured()) return res.status(503).json({ message: 'Billing is not configured yet.' });
  const sub = await Subscription.findOne({ user: req.user._id });
  if (!sub?.gatewaySubscriptionId) return res.status(400).json({ message: 'No active subscription.' });
  try {
    const atCycleEnd = req.body?.atCycleEnd !== false; // default: keep access until cycle end
    await razorpay.cancelSubscription(sub.gatewaySubscriptionId, atCycleEnd);
    sub.cancelAtPeriodEnd = atCycleEnd;
    if (!atCycleEnd) { sub.status = 'cancelled'; sub.plan = 'free'; }
    await sub.save();
    res.json({ ok: true, cancelAtPeriodEnd: atCycleEnd });
  } catch (err) {
    console.error('cancel error:', err?.error?.description || err.message);
    res.status(500).json({ message: 'Could not cancel subscription.' });
  }
};

/** POST /api/billing/webhook — Razorpay events (raw body). Keeps subs in sync. */
const webhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  try {
    if (!razorpay.verifyWebhook(req.body, signature)) {
      return res.status(400).send('Invalid signature');
    }
  } catch (err) {
    console.error('webhook verify failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let event;
  try { event = JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body); }
  catch { return res.status(400).send('Bad payload'); }

  try {
    const entity = event.payload?.subscription?.entity;
    if (entity && String(event.event).startsWith('subscription.')) {
      const userId = entity.notes?.userId || (await Subscription.findOne({ gatewaySubscriptionId: entity.id }))?.user;
      if (userId) await upsertFromRazorpaySub(userId, entity);
    }
  } catch (err) {
    console.error('webhook handling error:', err.message);
  }
  res.json({ received: true });
};

async function upsertFromRazorpaySub(userId, entity) {
  const dead = ['cancelled', 'completed', 'expired'].includes(entity.status);
  await Subscription.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      gateway: 'razorpay',
      plan: dead ? 'free' : planIdFromRazorpayPlanId(entity.plan_id),
      status: entity.status,
      gatewayCustomerId: entity.customer_id || null,
      gatewaySubscriptionId: entity.id,
      currentPeriodEnd: entity.current_end ? new Date(entity.current_end * 1000) : null,
    },
    { upsert: true }
  );
}

/**
 * POST /api/billing/dev/set-plan { plan } — testing helper to set a plan
 * without the gateway. Disabled in production.
 */
const devSetPlan = async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Disabled in production.' });
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ message: 'Unknown plan.' });
  await Subscription.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, plan, status: plan === 'free' ? 'none' : 'active' },
    { upsert: true }
  );
  const data = await getEntitlements(req.user._id, req.user.role);
  res.json({ ok: true, ...data });
};

module.exports = { entitlements, checkout, cancel, webhook, devSetPlan };
