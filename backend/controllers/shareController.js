const crypto = require('crypto');
const Share = require('../models/Share');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
const MAX_STEPS = 3000; // cap stored trace so shares stay lightweight

const token = () => crypto.randomBytes(6).toString('base64url'); // ~8 url-safe chars

const links = (t) => ({
  url: `${FRONTEND}/share/${t}`,
  embedUrl: `${FRONTEND}/embed/${t}`,
  oembedUrl: `${process.env.PUBLIC_API_URL || ''}/api/share/${t}/oembed`,
});

/** POST /api/share — create a shareable visualization. */
const createShare = async (req, res) => {
  try {
    const { title, language, code, trace, output } = req.body || {};
    if (!code) return res.status(400).json({ message: 'code is required.' });
    const steps = Array.isArray(trace) ? trace.slice(0, MAX_STEPS) : [];
    const share = await Share.create({
      token: token(),
      user: req.user._id,
      title: title?.slice(0, 140) || 'Untitled visualization',
      language: language || 'python',
      code,
      trace: steps,
      output: (output || '').slice(0, 20000),
    });
    res.status(201).json({ token: share.token, ...links(share.token) });
  } catch (err) {
    console.error('createShare error:', err.message);
    res.status(500).json({ message: 'Could not create share.' });
  }
};

/** GET /api/share/:token — public. Returns the share and increments views. */
const getShare = async (req, res) => {
  const share = await Share.findOneAndUpdate(
    { token: req.params.token, isPublic: true },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('user', 'name username');
  if (!share) return res.status(404).json({ message: 'Share not found.' });
  res.json({
    token: share.token,
    title: share.title,
    language: share.language,
    code: share.code,
    trace: share.trace,
    output: share.output,
    views: share.views,
    author: share.user ? { name: share.user.name, username: share.user.username } : null,
    createdAt: share.createdAt,
  });
};

/** GET /api/share/:token/oembed — oEmbed (rich) for blog/PR embeds. */
const oembed = async (req, res) => {
  const share = await Share.findOne({ token: req.params.token, isPublic: true });
  if (!share) return res.status(404).json({ message: 'Not found' });
  const { embedUrl } = links(share.token);
  res.json({
    version: '1.0',
    type: 'rich',
    provider_name: 'CodeViz',
    provider_url: FRONTEND,
    title: share.title,
    width: 720,
    height: 460,
    html: `<iframe src="${embedUrl}" width="720" height="460" frameborder="0" allowfullscreen title="${escapeHtml(share.title)}"></iframe>`,
  });
};

/** GET /api/share/mine — the current user's shares. */
const myShares = async (req, res) => {
  const shares = await Share.find({ user: req.user._id }).sort({ createdAt: -1 }).select('token title language views createdAt');
  res.json(shares.map((s) => ({ ...s.toObject(), ...links(s.token) })));
};

/** DELETE /api/share/:token — owner only. */
const deleteShare = async (req, res) => {
  const share = await Share.findOne({ token: req.params.token });
  if (!share) return res.status(404).json({ message: 'Not found.' });
  if (String(share.user) !== String(req.user._id)) return res.status(403).json({ message: 'Not your share.' });
  await share.deleteOne();
  res.json({ ok: true });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = { createShare, getShare, oembed, myShares, deleteShare };
