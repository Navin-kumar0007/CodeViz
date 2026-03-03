const Session = require('../models/Session');
const crypto = require('crypto');

// @route   POST /api/sessions
// @desc    Save a recorded session
const createSession = async (req, res) => {
    try {
        const { title, description, language, events, duration, tags, metadata, isPublic } = req.body;
        const userId = req.user._id;

        if (!title || !events || !events.length) {
            return res.status(400).json({ message: 'Title and events are required' });
        }

        const shareToken = crypto.randomBytes(16).toString('hex');

        const session = await Session.create({
            userId,
            title,
            description: description || '',
            language: language || 'python',
            events,
            duration: duration || 0,
            isPublic: isPublic || false,
            shareToken,
            tags: tags || [],
            metadata: {
                totalKeystrokes: metadata?.totalKeystrokes || 0,
                totalExecutions: metadata?.totalExecutions || 0,
                finalCode: metadata?.finalCode || '',
                eventCount: events.length
            }
        });

        res.status(201).json({
            _id: session._id,
            title: session.title,
            shareToken: session.shareToken,
            duration: session.duration,
            createdAt: session.createdAt
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/sessions
// @desc    Get all sessions for the logged-in user
const getSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const sessions = await Session.find({ userId })
            .select('-events') // Don't return full event data in list view
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Session.countDocuments({ userId });

        res.json({ sessions, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/sessions/:id
// @desc    Get a single session with full events
const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Only owner can view non-public sessions
        if (session.userId.toString() !== req.user._id.toString() && !session.isPublic) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/sessions/shared/:token
// @desc    Get a shared session by token (public, no auth)
const getSharedSession = async (req, res) => {
    try {
        const session = await Session.findOne({ shareToken: req.params.token, isPublic: true });
        if (!session) return res.status(404).json({ message: 'Session not found or not public' });

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   DELETE /api/sessions/:id
// @desc    Delete a session
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Session.findByIdAndDelete(req.params.id);
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PATCH /api/sessions/:id/toggle-public
// @desc    Toggle session public/private
const togglePublic = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        session.isPublic = !session.isPublic;
        await session.save();
        res.json({ isPublic: session.isPublic, shareToken: session.shareToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSession, getSessions, getSession, getSharedSession, deleteSession, togglePublic };
