const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/codeController');
const { protect } = require('../middleware/authMiddleware');

// Define the "Run" route
// Since server.js says app.use('/', codeRoutes), this becomes:
// POST http://localhost:5001/run
router.post('/run', protect, executeCode);

// Also add /trace route for the Learning module
// This uses the same controller since executeCode returns trace data
router.post('/trace', protect, executeCode);

module.exports = router;