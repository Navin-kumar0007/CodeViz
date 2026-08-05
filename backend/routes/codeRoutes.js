const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/codeController');
const { protect } = require('../middleware/authMiddleware');
const { meterUsage } = require('../middleware/billingMiddleware');

// Define the "Run" route
// Since server.js says app.use('/', codeRoutes), this becomes:
// POST http://localhost:5001/run
// 💳 Metered: counts against the user's daily execution limit (per plan).
router.post('/run', protect, meterUsage('executions'), executeCode);

// Also add /trace route for the Learning module
// This uses the same controller since executeCode returns trace data
router.post('/trace', protect, meterUsage('executions'), executeCode);

module.exports = router;