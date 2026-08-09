const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProgress, updateProgress, syncProgress, getSkillTree, getDNA, getFocus } = require('../controllers/progressController');

// All routes require authentication
router.get('/', protect, getProgress);
router.get('/skill-tree', protect, getSkillTree);
router.get('/dna', protect, getDNA);
router.get('/focus', protect, getFocus);
router.put('/', protect, updateProgress);
router.post('/sync', protect, syncProgress);

module.exports = router;
