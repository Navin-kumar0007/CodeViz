const asyncHandler = require('express-async-handler');
const VideoLesson = require('../models/VideoLesson');

/**
 * 🎬 Video Lessons Controller
 * CRUD for video lessons with topic linking and engagement
 */

// GET /api/videos — List all videos (optional filter by topic/category)
const getVideos = asyncHandler(async (req, res) => {
    const { topic, category } = req.query;
    const query = {};
    if (topic) query.topic = topic;
    if (category) query.category = category;

    const videos = await VideoLesson.find(query)
        .populate('addedBy', 'name role')
        .sort({ topic: 1, order: 1 });

    res.json(videos);
});

// GET /api/videos/:id — Get single video
const getVideoById = asyncHandler(async (req, res) => {
    const video = await VideoLesson.findById(req.params.id)
        .populate('addedBy', 'name role');

    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    // Increment views
    video.views = (video.views || 0) + 1;
    await video.save();

    res.json(video);
});

// POST /api/videos — Add new video (instructor/admin only)
const createVideo = asyncHandler(async (req, res) => {
    if (!['instructor', 'admin'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Only instructors can add videos');
    }

    const { title, description, videoUrl, videoType, duration, topic, category, order, timestamps } = req.body;

    if (!title || !videoUrl || !topic) {
        res.status(400);
        throw new Error('Title, videoUrl, and topic are required');
    }

    const video = await VideoLesson.create({
        title, description, videoUrl, videoType: videoType || 'youtube',
        duration: duration || 0, topic, category: category || 'other',
        order: order || 0, addedBy: req.user._id,
        timestamps: timestamps || []
    });

    res.status(201).json(video);
});

// PUT /api/videos/:id — Update video (instructor/admin)
const updateVideo = asyncHandler(async (req, res) => {
    if (!['instructor', 'admin'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Only instructors can edit videos');
    }

    const video = await VideoLesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }
    res.json(video);
});

// DELETE /api/videos/:id — Delete video (instructor/admin)
const deleteVideo = asyncHandler(async (req, res) => {
    if (!['instructor', 'admin'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Only instructors can delete videos');
    }

    const video = await VideoLesson.findByIdAndDelete(req.params.id);
    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }
    res.json({ message: 'Video deleted' });
});

// PUT /api/videos/:id/complete — Mark video as completed
const markComplete = asyncHandler(async (req, res) => {
    const video = await VideoLesson.findById(req.params.id);
    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    const userId = req.user._id.toString();
    if (!video.completedBy.includes(userId)) {
        video.completedBy.push(req.user._id);
        await video.save();
    }

    res.json({ completed: true, totalCompletions: video.completedBy.length });
});

// PUT /api/videos/:id/like — Toggle like
const toggleLike = asyncHandler(async (req, res) => {
    const video = await VideoLesson.findById(req.params.id);
    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    const userId = req.user._id.toString();
    const idx = video.likes.findIndex(id => id.toString() === userId);
    if (idx >= 0) {
        video.likes.splice(idx, 1);
    } else {
        video.likes.push(req.user._id);
    }
    await video.save();

    res.json({ likes: video.likes.length, liked: idx < 0 });
});

module.exports = { getVideos, getVideoById, createVideo, updateVideo, deleteVideo, markComplete, toggleLike };
