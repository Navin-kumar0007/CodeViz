const asyncHandler = require('express-async-handler');
const Discussion = require('../models/Discussion');

// @desc    Get discussions for a lesson
// @route   GET /api/discussions/:lessonId
// @access  Private
// 🧊 Import Redis Client
const { getClient } = require('../config/redis');

// @desc    Get discussions for a lesson
// @route   GET /api/discussions/:lessonId
// @access  Private
const getDiscussions = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    // Support "global" feed or specific lesson
    const query = lessonId === 'global' ? {} : { lessonId };

    const redis = getClient();
    const cacheKey = `discussions:${lessonId}`;

    // 1. Check Cache
    if (redis && redis.isOpen) {
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
        } catch (err) { console.error('Redis Get Error:', err); }
    }

    // 2. Fetch from DB
    // If global, maybe limit? For now, fetch all sorted.
    const discussions = await Discussion.find(query)
        .populate('userId', 'name role xp')
        .populate('replies.userId', 'name role')
        .sort({ createdAt: -1 });

    // 3. Set Cache
    if (redis && redis.isOpen) {
        try {
            await redis.setEx(cacheKey, 3600, JSON.stringify(discussions));
        } catch (err) { console.error('Redis Set Error:', err); }
    }

    res.json(discussions);
});

// @desc    Get single discussion by ID
// @route   GET /api/discussions/thread/:id
// @access  Private
const getDiscussionById = asyncHandler(async (req, res) => {
    const discussion = await Discussion.findById(req.params.id)
        .populate('userId', 'name role xp')
        .populate('replies.userId', 'name role');

    if (discussion) {
        res.json(discussion);
    } else {
        res.status(404);
        throw new Error('Discussion not found');
    }
});

// @desc    Post a new discussion/question
// @route   POST /api/discussions
// @access  Private
const createDiscussion = asyncHandler(async (req, res) => {
    const { lessonId, content } = req.body;

    if (!lessonId || !content) {
        res.status(400);
        throw new Error('Please provide lessonId and content');
    }

    const discussion = await Discussion.create({
        lessonId,
        userId: req.user._id,
        content
    });

    const fullDiscussion = await Discussion.findById(discussion._id).populate('userId', 'name role xp');

    // 🧊 INVALIDATE CACHE
    const redis = getClient();
    if (redis && redis.isOpen) {
        await redis.del(`discussions:${lessonId}`);
    }

    res.status(201).json(fullDiscussion);
});

// @desc    Reply to a discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
const replyToDiscussion = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (discussion) {
        const reply = {
            userId: req.user._id,
            content
        };

        discussion.replies.push(reply);
        await discussion.save();

        // Return updated discussion
        const updated = await Discussion.findById(req.params.id)
            .populate('userId', 'name role xp')
            .populate('replies.userId', 'name role');

        // 🧊 INVALIDATE CACHE (Need lessonId)
        const redis = getClient();
        if (redis && redis.isOpen) {
            await redis.del(`discussions:${discussion.lessonId}`);
        }

        res.json(updated);
    } else {
        res.status(404);
        throw new Error('Discussion not found');
    }
});

module.exports = {
    getDiscussions,
    createDiscussion,
    replyToDiscussion,
    getDiscussionById
};
