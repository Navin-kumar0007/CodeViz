const Problem = require('../models/Problem');
const Course = require('../models/Course');

// Public, unauthenticated read endpoints for SEO. They expose only safe fields
// (never test cases or editorial/solution content) so crawlers can index the
// catalog while the actual solving/answers stay behind login.

// GET /api/public/problems — browsable catalog (meta only).
const listProblems = async (req, res) => {
  try {
    const { difficulty, category, q } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (q) filter.title = { $regex: String(q).slice(0, 60), $options: 'i' };
    const problems = await Problem.find(filter)
      .select('title slug difficulty category topics companyTags stats')
      .sort({ order: 1 }).limit(500);
    res.json(problems.map((p) => ({
      title: p.title, slug: p.slug, difficulty: p.difficulty, category: p.category,
      topics: p.topics || [], companyTags: p.companyTags || [],
      acceptance: p.stats?.totalSubmissions ? Math.round((p.stats.acceptedSubmissions / p.stats.totalSubmissions) * 100) : null,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/public/problems/:slug — public detail (no test cases, no editorial).
const getProblem = async (req, res) => {
  try {
    const p = await Problem.findOne({ slug: req.params.slug })
      .select('title slug difficulty category topics companyTags description constraints examples hints editorial stats');
    if (!p) return res.status(404).json({ message: 'Problem not found' });
    res.json({
      title: p.title, slug: p.slug, difficulty: p.difficulty, category: p.category,
      topics: p.topics || [], companyTags: p.companyTags || [],
      description: p.description, constraints: p.constraints || [], examples: p.examples || [],
      hintCount: (p.hints || []).length,
      hasEditorial: !!p.editorial,
      acceptance: p.stats?.totalSubmissions ? Math.round((p.stats.acceptedSubmissions / p.stats.totalSubmissions) * 100) : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /sitemap.xml — problem + course + static URLs for crawlers.
const sitemap = async (req, res) => {
  try {
    const base = (process.env.FRONTEND_URL || 'https://codeviz.app').replace(/\/$/, '');
    const [problems, courses] = await Promise.all([
      Problem.find({}).select('slug').limit(1000),
      Course.find({ published: true }).select('slug'),
    ]);
    const urls = [
      '', '/home', '/about', '/pricing', '/explore', '/contact', '/support', '/privacy', '/terms',
      ...problems.map((p) => `/explore/${p.slug}`),
      ...courses.map((c) => `/learn`), // course content is behind login; link the hub
    ];
    const unique = [...new Set(urls)];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
      unique.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')
    }\n</urlset>`;
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('');
  }
};

module.exports = { listProblems, getProblem, sitemap };
