const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createShare, getShare, oembed, myShares, deleteShare } = require('../controllers/shareController');

// Public (no auth) — the growth surface.
router.get('/:token/oembed', oembed);
router.get('/:token', getShare);

// Authenticated
router.post('/', protect, createShare);
router.get('/mine/list', protect, myShares);
router.delete('/:token', protect, deleteShare);

module.exports = router;
