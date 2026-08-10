const mongoose = require('mongoose');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Share = require('../models/Share');

const levelFromXp = (xp = 0) => Math.floor(xp / 100) + 1;

/**
 * GET /api/users/public/:handle — public, SEO-friendly profile. `handle` may be
 * a username or a user id. No auth. Distribution + identity surface (Phase 4).
 */
const getPublicProfile = async (req, res) => {
  try {
    const handle = req.params.handle;
    const query = mongoose.isValidObjectId(handle) ? { $or: [{ _id: handle }, { username: handle.toLowerCase() }] } : { username: handle.toLowerCase() };
    const user = await User.findOne(query).select('name username bio role xp streak createdAt');
    if (!user) return res.status(404).json({ message: 'Profile not found.' });

    const [solved, shares] = await Promise.all([
      Submission.find({ user: user._id, verdict: 'accepted' }).distinct('problem'),
      Share.find({ user: user._id, isPublic: true }).sort({ createdAt: -1 }).limit(12).select('token title language views createdAt'),
    ]);

    res.json({
      name: user.name,
      username: user.username || null,
      bio: user.bio || '',
      role: user.role,
      joinedAt: user.createdAt,
      stats: {
        xp: user.xp || 0,
        level: levelFromXp(user.xp),
        streak: typeof user.streak === 'object' ? (user.streak.current || 0) : (user.streak || 0),
        problemsSolved: solved.length,
      },
      shares: shares.map((s) => ({ token: s.token, title: s.title, language: s.language, views: s.views, createdAt: s.createdAt })),
    });
  } catch (err) {
    console.error('getPublicProfile error:', err.message);
    res.status(500).json({ message: 'Could not load profile.' });
  }
};

/** PUT /api/users/username { username } — claim a public handle. */
const setUsername = async (req, res) => {
  const raw = String(req.body?.username || '').toLowerCase().trim();
  if (!/^[a-z0-9_]{3,20}$/.test(raw)) {
    return res.status(400).json({ message: 'Username must be 3-20 chars: letters, numbers, underscore.' });
  }
  const taken = await User.findOne({ username: raw, _id: { $ne: req.user._id } });
  if (taken) return res.status(409).json({ message: 'That username is taken.' });
  await User.findByIdAndUpdate(req.user._id, { username: raw });
  res.json({ ok: true, username: raw });
};

// GET /api/users/referral — my invite code, link, and count.
const getReferral = async (req, res) => {
  try {
    const u = await User.findById(req.user._id).select('referralCode referralCount');
    if (!u.referralCode) { await u.save(); } // pre-save assigns one for older accounts
    const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
    res.json({ code: u.referralCode, count: u.referralCount || 0, link: `${base}/signup?ref=${u.referralCode}` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getPublicProfile, setUsername, getReferral };
