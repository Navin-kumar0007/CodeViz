const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProgress, updateProgress, syncProgress } = require('../controllers/progressController');

// All routes require authentication
router.get('/', protect, getProgress);
router.put('/', protect, updateProgress);
router.post('/sync', protect, syncProgress);

module.exports = router;
