const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { entitlements, checkout, cancel, webhook, devSetPlan } = require('../controllers/billingController');

// NOTE: the webhook route needs the RAW body for signature verification and is
// mounted separately in server.js (before express.json). It is exported here
// only for reference; do not add express.json to it.
router.get('/entitlements', protect, entitlements);
router.post('/checkout', protect, checkout);
router.post('/cancel', protect, cancel);
router.post('/dev/set-plan', protect, devSetPlan);

module.exports = router;
module.exports.webhookHandler = webhook;
