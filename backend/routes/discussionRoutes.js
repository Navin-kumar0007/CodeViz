const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getDiscussions,
    getDiscussionById,
    createDiscussion,
    replyToDiscussion,
    toggleLike,
    toggleReplyLike,
    resolveThread,
    pinThread
} = require('../controllers/discussionController');

router.use(protect); // All routes protected

// Thread CRUD
router.get('/thread/:id', getDiscussionById);
router.get('/:lessonId', getDiscussions);     // supports ?category=&search=&sort=&page=
router.post('/', createDiscussion);
router.post('/:id/reply', replyToDiscussion);

// Engagement
router.put('/:id/like', toggleLike);
router.put('/:id/reply/:replyIdx/like', toggleReplyLike);

// Moderation
router.put('/:id/resolve', resolveThread);
router.put('/:id/pin', pinThread);

module.exports = router;
