const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDue, gradeItem } = require('../controllers/reviewController');

router.get('/due', protect, getDue);
router.post('/:problemId/grade', protect, gradeItem);

module.exports = router;
