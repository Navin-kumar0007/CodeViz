const CodeDraft = require('../models/CodeDraft');

// GET /api/drafts/:slug — the caller's drafts for a problem, keyed by language.
const getDrafts = async (req, res) => {
  try {
    const list = await CodeDraft.find({ user: req.user._id, problem: req.params.slug }).lean();
    const byLang = {};
    for (const d of list) byLang[d.language] = { code: d.code, updatedAt: d.updatedAt };
    res.json(byLang);
  } catch (err) {
    console.error('getDrafts error:', err);
    res.status(500).json({ error: 'Could not load drafts' });
  }
};

// PUT /api/drafts/:slug { language, code } — upsert the draft for that language.
const saveDraft = async (req, res) => {
  try {
    const { language, code } = req.body;
    if (!language) return res.status(400).json({ error: 'language is required' });
    const d = await CodeDraft.findOneAndUpdate(
      { user: req.user._id, problem: req.params.slug, language },
      { $set: { code: typeof code === 'string' ? code : '' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json({ updatedAt: d.updatedAt });
  } catch (err) {
    console.error('saveDraft error:', err);
    res.status(500).json({ error: 'Could not save draft' });
  }
};

module.exports = { getDrafts, saveDraft };
