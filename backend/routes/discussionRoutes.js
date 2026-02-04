const express = require('express');
const router = express.Router();
const { getDiscussions, createDiscussion, replyToDiscussion, getDiscussionById } = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes protected

router.get('/thread/:id', getDiscussionById);
router.get('/:lessonId', getDiscussions);
router.post('/', createDiscussion);
router.post('/:id/reply', replyToDiscussion);

module.exports = router;
