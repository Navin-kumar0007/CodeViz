const express = require('express');
const { registerUser, loginUser, logoutUser, generate2FA, verify2FA, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Define the paths
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// 2FA Routes (Protected)
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);

// Password Recovery
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;