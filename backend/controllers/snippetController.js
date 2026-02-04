const asyncHandler = require('express-async-handler');
const Snippet = require('../models/Snippet');

// @desc    Create a new snippet
// @route   POST /api/snippets
// @access  Private
const createSnippet = asyncHandler(async (req, res) => {
    const { title, code, language } = req.body;

    const snippet = await Snippet.create({
        userId: req.user._id,
        title,
        code,
        language
    });

    res.status(201).json(snippet);
});

// @desc    Get user snippets
// @route   GET /api/snippets/:userId
// @access  Private
const getUserSnippets = asyncHandler(async (req, res) => {
    const snippets = await Snippet.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(snippets);
});

// @desc    Share a snippet (make public)
// @route   PUT /api/snippets/:id/share
// @access  Private
const shareSnippet = asyncHandler(async (req, res) => {
    const snippet = await Snippet.findById(req.params.id);

    if (snippet) {
        if (snippet.userId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to share this snippet');
        }

        snippet.isShared = true;
        snippet.sharedAt = Date.now();
        await snippet.save();
        res.json(snippet);
    } else {
        res.status(404);
        throw new Error('Snippet not found');
    }
});

// @desc    Get all shared snippets
// @route   GET /api/snippets/public/all
// @access  Public
const getSharedSnippets = asyncHandler(async (req, res) => {
    const snippets = await Snippet.find({ isShared: true })
        .populate('userId', 'name role')
        .sort({ sharedAt: -1 })
        .limit(20);
    res.json(snippets);
});

module.exports = {
    createSnippet,
    getUserSnippets,
    shareSnippet,
    getSharedSnippets
};
