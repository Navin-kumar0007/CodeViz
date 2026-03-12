const PeerReview = require('../models/PeerReview');

/**
 * @route   GET /api/peer-reviews
 * @desc    Get all active peer review requests
 * @access  Private
 */
const getPeerReviews = async (req, res) => {
    try {
        const query = req.query.status ? { status: req.query.status } : {};
        const reviews = await PeerReview.find(query)
            .populate('userId', 'name role')
            .populate('comments.userId', 'name role')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   GET /api/peer-reviews/:id
 * @desc    Get single peer review request by ID
 * @access  Private
 */
const getPeerReviewById = async (req, res) => {
    try {
        const review = await PeerReview.findById(req.params.id)
            .populate('userId', 'name role')
            .populate('comments.userId', 'name role');

        if (!review) {
            return res.status(404).json({ message: 'Peer review request not found' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   POST /api/peer-reviews
 * @desc    Create a new peer review request
 * @access  Private
 */
const createPeerReview = async (req, res) => {
    try {
        const { title, description, code, language } = req.body;

        if (!title || !code) {
            return res.status(400).json({ message: 'Title and code are required' });
        }

        const review = await PeerReview.create({
            userId: req.user._id,
            title,
            description: description || '',
            code,
            language: language || 'python',
            status: 'open'
        });

        const populatedReview = await PeerReview.findById(review._id).populate('userId', 'name role');
        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   POST /api/peer-reviews/:id/comments
 * @desc    Add a comment to a peer review
 * @access  Private
 */
const addComment = async (req, res) => {
    try {
        const { text, line } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const review = await PeerReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Peer review request not found' });
        }

        const comment = {
            userId: req.user._id,
            text,
            line: line || null
        };

        review.comments.push(comment);
        await review.save();

        const updatedReview = await PeerReview.findById(req.params.id)
            .populate('userId', 'name role')
            .populate('comments.userId', 'name role');

        res.status(201).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   PUT /api/peer-reviews/:id/resolve
 * @desc    Mark a peer review as resolved
 * @access  Private (Owner only)
 */
const resolvePeerReview = async (req, res) => {
    try {
        const review = await PeerReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Peer review request not found' });
        }

        // Ensure user is the owner
        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to resolve this request' });
        }

        review.status = 'resolved';
        await review.save();

        const updatedReview = await PeerReview.findById(req.params.id)
            .populate('userId', 'name role')
            .populate('comments.userId', 'name role');

        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPeerReviews,
    getPeerReviewById,
    createPeerReview,
    addComment,
    resolvePeerReview
};
