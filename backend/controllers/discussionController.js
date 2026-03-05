const asyncHandler = require('express-async-handler');
const Discussion = require('../models/Discussion');
const { getClient } = require('../config/redis');

/**
 * 💬 Discussion Forum Controller
 * Extended with forum features: categories, likes, resolve, pin, pagination
 */

// GET /api/discussions/:lessonId — List threads (paginated, filterable)
const getDiscussions = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const { category, search, sort = 'latest', page = 1, limit = 20 } = req.query;

    // Build query
    const query = lessonId === 'global' || lessonId === 'all' ? {} : { lessonId };
    if (category && category !== 'all') query.category = category;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
        ];
    }

    // Sort options
    let sortOpt = { isPinned: -1 };
    if (sort === 'latest') sortOpt.createdAt = -1;
    else if (sort === 'popular') sortOpt['likes'] = -1;
    else if (sort === 'unanswered') {
        query.replies = { $size: 0 };
        sortOpt.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [discussions, total] = await Promise.all([
        Discussion.find(query)
            .populate('userId', 'name role xp')
            .sort(sortOpt)
            .skip(skip)
            .limit(Number(limit)),
        Discussion.countDocuments(query)
    ]);

    res.json({
        threads: discussions,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    });
});

// GET /api/discussions/thread/:id — Get single thread with replies
const getDiscussionById = asyncHandler(async (req, res) => {
    const discussion = await Discussion.findById(req.params.id)
        .populate('userId', 'name role xp')
        .populate('replies.userId', 'name role');

    if (!discussion) {
        res.status(404);
        throw new Error('Discussion not found');
    }

    // Increment views
    discussion.views = (discussion.views || 0) + 1;
    await discussion.save();

    res.json(discussion);
});

// POST /api/discussions — Create new thread
const createDiscussion = asyncHandler(async (req, res) => {
    const { title, content, category = 'general', tags = [], lessonId = 'general' } = req.body;

    if (!title || !content) {
        res.status(400);
        throw new Error('Title and content are required');
    }

    const discussion = await Discussion.create({
        title,
        content,
        category,
        tags: tags.slice(0, 5), // max 5 tags
        lessonId,
        userId: req.user._id
    });

    const full = await Discussion.findById(discussion._id).populate('userId', 'name role xp');
    res.status(201).json(full);
});

// POST /api/discussions/:id/reply — Reply to thread
const replyToDiscussion = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        res.status(400);
        throw new Error('Reply content is required');
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
        res.status(404);
        throw new Error('Discussion not found');
    }

    discussion.replies.push({ userId: req.user._id, content, likes: [] });
    await discussion.save();

    const updated = await Discussion.findById(req.params.id)
        .populate('userId', 'name role xp')
        .populate('replies.userId', 'name role');

    res.json(updated);
});

// PUT /api/discussions/:id/like — Toggle upvote on thread
const toggleLike = asyncHandler(async (req, res) => {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
        res.status(404);
        throw new Error('Discussion not found');
    }

    const userId = req.user._id.toString();
    const idx = discussion.likes.findIndex(id => id.toString() === userId);

    if (idx >= 0) {
        discussion.likes.splice(idx, 1); // unlike
    } else {
        discussion.likes.push(req.user._id); // like
    }
    await discussion.save();

    res.json({ likes: discussion.likes.length, liked: idx < 0 });
});

// PUT /api/discussions/:id/reply/:replyIdx/like — Toggle upvote on reply
const toggleReplyLike = asyncHandler(async (req, res) => {
    const { replyIdx } = req.params;
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
        res.status(404);
        throw new Error('Discussion not found');
    }

    const reply = discussion.replies[Number(replyIdx)];
    if (!reply) {
        res.status(404);
        throw new Error('Reply not found');
    }

    const userId = req.user._id.toString();
    if (!reply.likes) reply.likes = [];
    const idx = reply.likes.findIndex(id => id.toString() === userId);

    if (idx >= 0) {
        reply.likes.splice(idx, 1);
    } else {
        reply.likes.push(req.user._id);
    }
    await discussion.save();

    res.json({ likes: reply.likes.length, liked: idx < 0 });
});

// PUT /api/discussions/:id/resolve — Mark thread as resolved
const resolveThread = asyncHandler(async (req, res) => {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
        res.status(404);
        throw new Error('Discussion not found');
    }

    // Only author or instructor/admin can resolve
    if (discussion.userId.toString() !== req.user._id.toString() &&
        !['instructor', 'admin'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Not authorized to resolve this thread');
    }

    const { acceptedReplyIdx } = req.body;
    discussion.isResolved = !discussion.isResolved;
    if (acceptedReplyIdx !== undefined) {
        discussion.acceptedReplyIdx = acceptedReplyIdx;
    }
    await discussion.save();

    res.json({ isResolved: discussion.isResolved, acceptedReplyIdx: discussion.acceptedReplyIdx });
});

// PUT /api/discussions/:id/pin — Pin/unpin thread (instructor/admin only)
const pinThread = asyncHandler(async (req, res) => {
    if (!['instructor', 'admin'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Only instructors and admins can pin threads');
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
        res.status(404);
        throw new Error('Discussion not found');
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({ isPinned: discussion.isPinned });
});

module.exports = {
    getDiscussions,
    getDiscussionById,
    createDiscussion,
    replyToDiscussion,
    toggleLike,
    toggleReplyLike,
    resolveThread,
    pinThread
};
