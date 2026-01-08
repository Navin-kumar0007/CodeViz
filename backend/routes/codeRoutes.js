const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/codeController');

// Define the "Run" route
// Since server.js says app.use('/', codeRoutes), this becomes:
// POST http://localhost:5001/run
router.post('/run', executeCode);

module.exports = router;