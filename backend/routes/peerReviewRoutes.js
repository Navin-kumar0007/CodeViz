const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getPeerReviews,
    getPeerReviewById,
    createPeerReview,
    addComment,
    resolvePeerReview
} = require('../controllers/peerReviewController');

router.route('/')
    .get(protect, getPeerReviews)
    .post(protect, createPeerReview);

router.route('/:id')
    .get(protect, getPeerReviewById);

router.route('/:id/comments')
    .post(protect, addComment);

router.route('/:id/resolve')
    .put(protect, resolvePeerReview);

module.exports = router;
