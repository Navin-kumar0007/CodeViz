const express = require('express');
const router = express.Router();
const { createSnippet, getUserSnippets, shareSnippet, getSharedSnippets } = require('../controllers/snippetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public/all', getSharedSnippets);
router.use(protect);
router.post('/', createSnippet);
router.get('/:userId', getUserSnippets);
router.put('/:id/share', shareSnippet);

module.exports = router;