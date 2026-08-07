const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSubmissionReport, getRecent } = require('../controllers/integrityController');

router.get('/recent', protect, getRecent);
router.get('/submission/:id', protect, getSubmissionReport);

module.exports = router;
