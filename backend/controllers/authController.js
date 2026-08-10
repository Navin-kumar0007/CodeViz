const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot generate tokens.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate password strength
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Sanitize name — strip HTML tags to prevent XSS
    const sanitizedName = (name || '').replace(/<[^>]*>/g, '').trim();
    if (!sanitizedName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name: sanitizedName, email, password });

    if (user) {
      // Welcome email — fire-and-forget, never blocks signup.
      try {
        const { sendEmail, welcome } = require('../services/emailService');
        sendEmail({ to: user.email, ...welcome({ name: user.name }) });
      } catch { /* ignore */ }
      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token, // also returned so the client can use a Bearer header (cross-origin/tunnel-safe)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is suspended
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is suspended. Contact admin.' });
    }

    if (await user.matchPassword(password)) {
      // Update last login time using findByIdAndUpdate to avoid pre-save hook
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // If 2FA is enabled on backend, we could send a flag here to prompt the frontend to ask for token before granting access.
      // For now, simpler setup: token is set.

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled || false,
        token, // also returned for Bearer-header auth (cross-origin/tunnel-safe)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Generate 2FA Secret and QR Code
// @route   POST /api/users/2fa/generate
const generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const secret = speakeasy.generateSecret({
      name: `CodeViz (${user.email})`
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      res.json({
        secret: secret.base32,
        qrCode: data_url
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify and Enable 2FA
// @route   POST /api/users/2fa/verify
const verify2FA = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user._id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ message: 'Two-factor authentication enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Always respond the same way to avoid leaking which emails are registered.
  const generic = { message: 'If an account exists for that email, a reset link has been sent.' };
  try {
    const user = await User.findOne({ email });
    if (user) {
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      const { sendEmail, passwordReset } = require('../services/emailService');
      await sendEmail({ to: user.email, ...passwordReset({ name: user.name, resetUrl }) });
    }
    res.status(200).json(generic);
  } catch (error) {
    // Don't reveal internal errors on this endpoint either.
    res.status(200).json(generic);
  }
};

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Validate password strength
    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully. You may now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, generate2FA, verify2FA, forgotPassword, resetPassword };