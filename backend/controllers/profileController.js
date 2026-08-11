const mongoose = require('mongoose');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Share = require('../models/Share');
const Certificate = require('../models/Certificate');

const levelFromXp = (xp = 0) => Math.floor(xp / 100) + 1;

// Aggregate authorship telemetry across a set of accepted submissions into a public,
// employer-facing "proof of work": how much of the code was hand-typed vs pasted.
function authorshipFrom(subs) {
  let typed = 0, pasted = 0, scored = 0, verified = 0;
  for (const s of subs) {
    const it = s.integrity;
    const total = (it?.typedChars || 0) + (it?.pastedChars || 0);
    if (total <= 0) continue;
    scored += 1;
    typed += it.typedChars || 0;
    pasted += it.pastedChars || 0;
    if ((it.pastedChars || 0) / total < 0.3) verified += 1; // mostly hand-typed
  }
  const totalChars = typed + pasted;
  const typedPct = totalChars ? Math.round((typed / totalChars) * 100) : null;
  const confidence = typedPct === null ? 'unrated' : typedPct >= 80 ? 'high' : typedPct >= 55 ? 'moderate' : 'low';
  return { scoredSolutions: scored, verifiedSolutions: verified, typedPct, confidence };
}

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

    const [accepted, shares, certs] = await Promise.all([
      Submission.find({ user: user._id, verdict: 'accepted' }).populate('problem', 'category difficulty').select('problem integrity').lean(),
      Share.find({ user: user._id, isPublic: true }).sort({ createdAt: -1 }).limit(12).select('token title language views createdAt'),
      Certificate.find({ userId: user._id }).sort({ issueDate: -1 }).limit(12).select('credentialId courseName score issueDate type').lean(),
    ]);

    // One record per solved problem (first accepted), for skills + authorship.
    const byProblem = new Map();
    for (const s of accepted) {
      const id = String(s.problem?._id || s.problem || '');
      if (id && !byProblem.has(id)) byProblem.set(id, s);
    }
    const unique = [...byProblem.values()];

    // Skill map: solved counts per category, split by difficulty.
    const skillMap = {};
    for (const s of unique) {
      const cat = s.problem?.category || 'other';
      const diff = s.problem?.difficulty || 'medium';
      const k = (skillMap[cat] ||= { category: cat, solved: 0, easy: 0, medium: 0, hard: 0 });
      k.solved += 1;
      if (diff in k) k[diff] += 1;
    }
    const skills = Object.values(skillMap).sort((a, b) => b.solved - a.solved);

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
        problemsSolved: unique.length,
      },
      skills,
      authorship: authorshipFrom(unique),
      certificates: certs.map((c) => ({ credentialId: c.credentialId, courseName: c.courseName, score: c.score, issueDate: c.issueDate, type: c.type })),
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
