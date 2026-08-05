/**
 * Razorpay wrapper (India-friendly gateway). Lazily initialised so the server
 * boots fine without keys — billing endpoints report "not configured" until
 * RAZORPAY_KEY_ID/SECRET are set. Works in Razorpay test mode immediately.
 *
 * Recurring billing uses Razorpay Subscriptions; subscriptions.create returns a
 * hosted `short_url` we redirect the user to (mirrors Stripe Checkout).
 */
let client = null;

function getClient() {
  if (client) return client;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  // eslint-disable-next-line global-require
  const Razorpay = require('razorpay');
  client = new Razorpay({ key_id, key_secret });
  return client;
}

const isConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

async function createCustomer({ email, name, userId }) {
  const rz = getClient();
  if (!rz) throw new Error('Razorpay not configured');
  // fail_existing: 0 -> return the existing customer instead of erroring
  return rz.customers.create({ name, email, notes: { userId: String(userId) }, fail_existing: 0 });
}

/**
 * Create a subscription for a Razorpay plan. Returns { id, short_url, status }.
 * total_count is the number of billing cycles (default ~10 years of monthly).
 */
async function createSubscription({ planId, customerId, userId, totalCount = 120 }) {
  const rz = getClient();
  if (!rz) throw new Error('Razorpay not configured');
  return rz.subscriptions.create({
    plan_id: planId,
    customer_id: customerId || undefined,
    total_count: totalCount,
    customer_notify: 1,
    notes: { userId: String(userId) },
  });
}

async function cancelSubscription(subscriptionId, atCycleEnd = false) {
  const rz = getClient();
  if (!rz) throw new Error('Razorpay not configured');
  return rz.subscriptions.cancel(subscriptionId, atCycleEnd);
}

async function getSubscription(subscriptionId) {
  const rz = getClient();
  if (!rz) throw new Error('Razorpay not configured');
  return rz.subscriptions.fetch(subscriptionId);
}

/** Verify a webhook signature over the raw request body. Returns boolean. */
function verifyWebhook(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET not set');
  // eslint-disable-next-line global-require
  const Razorpay = require('razorpay');
  const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
  return Razorpay.validateWebhookSignature(body, signature, secret);
}

module.exports = {
  isConfigured,
  createCustomer,
  createSubscription,
  cancelSubscription,
  getSubscription,
  verifyWebhook,
  keyId: () => process.env.RAZORPAY_KEY_ID || null,
};
