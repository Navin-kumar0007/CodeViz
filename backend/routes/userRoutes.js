const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, logoutUser, generate2FA, verify2FA, forgotPassword, resetPassword } = require('../controllers/authController');
const { getPublicProfile, setUsername } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 🔒 Throttle credential endpoints to blunt brute-force / credential-stuffing.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 12, // per IP per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

// Define the paths
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);

// Public profile (SEO) + username management
router.get('/public/:handle', getPublicProfile);
router.put('/username', protect, setUsername);

// 2FA Routes (Protected)
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);

// Password Recovery
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:token', authLimiter, resetPassword);

module.exports = router;