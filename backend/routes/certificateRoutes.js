const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { claimForCourse, getMy, verify } = require('../controllers/certificateController');

/**
 * 🎓 Certificate Routes — earned, server-verified credentials.
 */

// Claim a certificate for a course you've actually completed (verified server-side).
router.post('/course/:slug', protect, claimForCourse);

// Your certificates.
router.get('/my', protect, getMy);

// Public verification.
router.get('/verify/:credentialId', verify);

module.exports = router;
