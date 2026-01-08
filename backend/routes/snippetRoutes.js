const express = require('express');
const Snippet = require('../models/Snippet');
const router = express.Router();

// @route   POST /api/snippets
// @desc    Create a new snippet
router.post('/', async (req, res) => {
    const { userId, title, code, language } = req.body;

    try {
        const snippet = await Snippet.create({
            user: userId,
            title,
            code,
            language
        });
        res.status(201).json(snippet);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
});

// @route   GET /api/snippets/:userId
// @desc    Get all snippets for a user
router.get('/:userId', async (req, res) => {
    try {
        const snippets = await Snippet.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(snippets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;