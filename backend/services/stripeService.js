/**
 * Thin Stripe wrapper. Lazily initialised so the server boots fine without a
 * key (billing endpoints just report "not configured" until STRIPE_SECRET_KEY
 * is set). Everything works in Stripe test mode the moment a test key is added.
 */
let stripe = null;

function getStripe() {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // eslint-disable-next-line global-require
  const Stripe = require('stripe');
  stripe = new Stripe(key);
  return stripe;
}

const isConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession({ priceId, customerId, userId, successUrl, cancelUrl, quantity = 1 }) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');
  return s.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity }],
    customer: customerId || undefined,
    client_reference_id: String(userId),
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: { userId: String(userId) },
  });
}

async function createBillingPortalSession({ customerId, returnUrl }) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');
  return s.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

async function createCustomer({ email, name, userId }) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');
  return s.customers.create({ email, name, metadata: { userId: String(userId) } });
}

/** Verify + parse a webhook event from the raw request body. */
function constructEvent(rawBody, signature) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not set');
  return s.webhooks.constructEvent(rawBody, signature, secret);
}

async function getSubscription(subscriptionId) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');
  return s.subscriptions.retrieve(subscriptionId);
}

module.exports = {
  isConfigured,
  createCheckoutSession,
  createBillingPortalSession,
  createCustomer,
  constructEvent,
  getSubscription,
};
