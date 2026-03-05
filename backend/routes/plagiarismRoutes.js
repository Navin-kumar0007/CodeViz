const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkPlagiarism, compareTwoSubmissions } = require('../controllers/plagiarismController');

router.use(protect);

router.post('/check', checkPlagiarism);     // Bulk check
router.post('/compare', compareTwoSubmissions); // Two-code comparison

module.exports = router;
