const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const ContactMessage = require('../models/ContactMessage');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public submit — tightly rate-limited to deter spam.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages. Please try again later.' },
});

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));

// POST /api/contact — public
router.post('/', submitLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name?.trim() || !message?.trim() || !isEmail(email)) {
      return res.status(400).json({ message: 'Please provide your name, a valid email, and a message.' });
    }
    await ContactMessage.create({
      name: name.trim().slice(0, 120),
      email: email.trim().slice(0, 200),
      subject: (subject || 'General').slice(0, 140),
      message: message.trim().slice(0, 4000),
    });
    res.status(201).json({ ok: true, message: "Thanks! We'll get back to you soon." });
  } catch (err) {
    console.error('contact submit error:', err.message);
    res.status(500).json({ message: 'Could not send your message. Please try again.' });
  }
});

// GET /api/contact — admin: list messages
router.get('/', protect, adminOnly, async (req, res) => {
  const msgs = await ContactMessage.find().sort({ createdAt: -1 }).limit(200);
  res.json(msgs);
});

module.exports = router;
