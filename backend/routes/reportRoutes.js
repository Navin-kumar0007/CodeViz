const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWeeklyReport, getAnalytics } = require('../controllers/reportController');

router.use(protect);

router.get('/weekly', getWeeklyReport);
router.get('/analytics', getAnalytics);

module.exports = router;
