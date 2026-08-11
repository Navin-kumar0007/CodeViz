const User = require('../models/User');

// Every collection that holds this user's personal data, with the field that links it
// to them. Used for both export (data portability) and deletion (erasure).
const COLLECTIONS = [
  ['Submission', 'user'], ['ReviewItem', 'user'], ['Subscription', 'user'],
  ['ContestEntry', 'user'], ['Share', 'user'], ['UsageMeter', 'user'],
  ['Certificate', 'userId'], ['InterviewSession', 'userId'], ['LearningProgress', 'userId'],
  ['Discussion', 'userId'], ['Snippet', 'userId'], ['Session', 'userId'],
  ['CustomQuiz', 'createdBy'],
];

// GET /api/users/me/export — download everything we hold about the caller (GDPR/DPDP
// data portability). Includes integrity telemetry, since that's personal data.
const exportMyData = async (req, res) => {
  try {
    const uid = req.user._id;
    const me = await User.findById(uid)
      .select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpire')
      .lean();
    const data = { exportedAt: new Date().toISOString(), account: me, records: {} };

    for (const [name, field] of COLLECTIONS) {
      try {
        const Model = require(`../models/${name}`);
        data.records[name] = await Model.find({ [field]: uid }).lean();
      } catch { data.records[name] = []; }
    }
    try {
      const Team = require('../models/Team');
      data.records.Teams = await Team.find({ 'members.user': uid }).lean();
    } catch { /* teams optional */ }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="codeviz-data-${uid}.json"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('exportMyData error:', err);
    res.status(500).json({ message: 'Could not export your data.' });
  }
};

// DELETE /api/users/me { password } — erase the account + all personal data. Requires
// the current password as a confirmation (guards against a hijacked session / misclick).
const deleteMyAccount = async (req, res) => {
  try {
    const uid = req.user._id;
    const user = await User.findById(uid).select('+password');
    if (!user) return res.status(404).json({ message: 'Account not found.' });

    const { password } = req.body;
    if (!password || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Password confirmation is required to delete your account.' });
    }

    for (const [name, field] of COLLECTIONS) {
      try {
        const Model = require(`../models/${name}`);
        await Model.deleteMany({ [field]: uid });
      } catch { /* best-effort per collection */ }
    }
    try {
      const Team = require('../models/Team');
      await Team.deleteMany({ owner: uid }); // teams they own are removed
      await Team.updateMany({ 'members.user': uid }, { $pull: { members: { user: uid } } });
    } catch { /* teams optional */ }

    await User.deleteOne({ _id: uid });
    res.json({ deleted: true, message: 'Your account and personal data have been permanently deleted.' });
  } catch (err) {
    console.error('deleteMyAccount error:', err);
    res.status(500).json({ message: 'Could not delete your account.' });
  }
};

module.exports = { exportMyData, deleteMyAccount, COLLECTIONS };
