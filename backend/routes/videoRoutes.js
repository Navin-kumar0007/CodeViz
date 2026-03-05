const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getVideos, getVideoById, createVideo,
    updateVideo, deleteVideo, markComplete, toggleLike
} = require('../controllers/videoController');

router.use(protect);

router.get('/', getVideos);        // ?topic=arrays&category=arrays
router.get('/:id', getVideoById);
router.post('/', createVideo);     // instructor/admin only
router.put('/:id', updateVideo);   // instructor/admin only
router.delete('/:id', deleteVideo);
router.put('/:id/complete', markComplete);
router.put('/:id/like', toggleLike);

module.exports = router;
