const Subscription = require('../models/Subscription');
const User = require('../models/User');
const stripeService = require('../services/stripeService');
const { getEntitlements } = require('../services/entitlementService');
const { PLANS, getPlan, planIdFromPriceId } = require('../config/plans');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

/** GET /api/billing/entitlements — current plan, features, limits, usage. */
const entitlements = async (req, res) => {
  const data = await getEntitlements(req.user._id);
  res.json({ ...data, stripeConfigured: stripeService.isConfigured(), plans: publicPlans() });
};

/** Public-safe plan catalogue for the pricing page. */
function publicPlans() {
  return Object.values(PLANS).map((p) => ({
    id: p.id, name: p.name, features: p.features, limits: p.limits, purchasable: Boolean(p.priceId),
  }));
}

/** POST /api/billing/checkout { plan } — start a Stripe Checkout session. */
const checkout = async (req, res) => {
  const { plan } = req.body;
  const def = getPlan(plan);
  if (!def || def.id === 'free') return res.status(400).json({ message: 'Choose a paid plan.' });
  if (!def.priceId) return res.status(400).json({ message: `Plan "${def.id}" has no configured price.` });
  if (!stripeService.isConfigured()) return res.status(503).json({ message: 'Billing is not configured yet.' });

  try {
    let sub = await Subscription.findOne({ user: req.user._id });
    let customerId = sub?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer({ email: req.user.email, name: req.user.name, userId: req.user._id });
      customerId = customer.id;
      sub = await Subscription.findOneAndUpdate(
        { user: req.user._id }, { stripeCustomerId: customerId }, { upsert: true, new: true }
      );
    }
    const session = await stripeService.createCheckoutSession({
      priceId: def.priceId,
      customerId,
      userId: req.user._id,
      successUrl: `${FRONTEND}/profile?billing=success`,
      cancelUrl: `${FRONTEND}/profile?billing=cancel`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('checkout error:', err.message);
    res.status(500).json({ message: 'Could not start checkout.' });
  }
};

/** POST /api/billing/portal — open the Stripe customer portal. */
const portal = async (req, res) => {
  if (!stripeService.isConfigured()) return res.status(503).json({ message: 'Billing is not configured yet.' });
  const sub = await Subscription.findOne({ user: req.user._id });
  if (!sub?.stripeCustomerId) return res.status(400).json({ message: 'No billing account yet.' });
  try {
    const session = await stripeService.createBillingPortalSession({ customerId: sub.stripeCustomerId, returnUrl: `${FRONTEND}/profile` });
    res.json({ url: session.url });
  } catch (err) {
    console.error('portal error:', err.message);
    res.status(500).json({ message: 'Could not open billing portal.' });
  }
};

/** POST /api/billing/webhook — Stripe events (raw body). Keeps subs in sync. */
const webhook = async (req, res) => {
  let event;
  try {
    event = stripeService.constructEvent(req.body, req.headers['stripe-signature']);
  } catch (err) {
    console.error('webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = obj.metadata?.userId || obj.client_reference_id;
        if (userId && obj.subscription) {
          const stripeSub = await stripeService.getSubscription(obj.subscription);
          await upsertFromStripeSub(userId, obj.customer, stripeSub);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const sub = await Subscription.findOne({ stripeSubscriptionId: obj.id });
        const userId = sub?.user || obj.metadata?.userId;
        if (userId) await upsertFromStripeSub(userId, obj.customer, obj);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('webhook handling error:', err.message);
  }
  res.json({ received: true });
};

async function upsertFromStripeSub(userId, customerId, stripeSub) {
  const priceId = stripeSub.items?.data?.[0]?.price?.id;
  const plan = planIdFromPriceId(priceId);
  const canceled = stripeSub.status === 'canceled';
  await Subscription.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      plan: canceled ? 'free' : plan,
      status: stripeSub.status,
      seats: stripeSub.items?.data?.[0]?.quantity || 1,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      currentPeriodEnd: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
      cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
    },
    { upsert: true }
  );
}

/**
 * POST /api/billing/dev/set-plan { plan } — testing helper to set a plan
 * without Stripe. Disabled in production.
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
  const data = await getEntitlements(req.user._id);
  res.json({ ok: true, ...data });
};

module.exports = { entitlements, checkout, portal, webhook, devSetPlan };
