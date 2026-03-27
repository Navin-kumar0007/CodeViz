const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Certificate = require('../models/Certificate');
const crypto = require('crypto');

/**
 * 🎓 Certificate Routes
 */

// @desc    Issue a new certificate
// @route   POST /api/certificates/issue
// @access  Protected
router.post('/issue', protect, async (req, res) => {
    try {
        const { courseName, skillData, type } = req.body;

        if (!courseName) {
            return res.status(400).json({ message: 'Course name is required' });
        }

        const credentialId = `CV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const certificate = await Certificate.create({
            userId: req.user._id,
            courseName,
            credentialId,
            skillData: skillData || {},
            type: type || 'mastery'
        });

        res.status(201).json(certificate);
    } catch (error) {
        console.error('Issue certificate error:', error);
        res.status(500).json({ message: 'Failed to issue certificate' });
    }
});

// @desc    Get user certificates
// @route   GET /api/certificates/my
// @access  Protected
router.get('/my', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user._id }).sort('-createdAt');
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch certificates' });
    }
});

// @desc    Verify a certificate by ID
// @route   GET /api/certificates/verify/:credentialId
// @access  Public
router.get('/verify/:credentialId', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ credentialId: req.params.credentialId })
            .populate('userId', 'name');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: 'Verification error' });
    }
});

module.exports = router;
