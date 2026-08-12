const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDrafts, saveDraft } = require('../controllers/draftController');

router.get('/:slug', protect, getDrafts);
router.put('/:slug', protect, saveDraft);

module.exports = router;
