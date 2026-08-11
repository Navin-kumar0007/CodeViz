const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const User = require('../models/User');

const canManage = (team, userId) => ['owner', 'admin'].includes(team.roleOf(userId));

const shape = (team) => ({
  id: team._id,
  name: team.name,
  plan: team.plan,
  status: team.status,
  active: team.isActive(),
  seats: team.seats,
  seatsUsed: team.seatsUsed(),
  inviteCode: team.inviteCode,
  members: (team.members || []).map((m) => ({
    user: m.user?._id || m.user,
    name: m.user?.name,
    email: m.user?.email,
    role: m.role,
    addedAt: m.addedAt,
  })),
});

// POST /api/teams — create a team (creator becomes owner). Starts inactive: no plan is
// inherited until an admin activates it (or, later, billing does), so this can't self-upgrade.
const createTeam = asyncHandler(async (req, res) => {
  const { name, seats } = req.body;
  if (!name || !name.trim()) { res.status(400); throw new Error('Team name is required'); }
  const team = await Team.create({
    name: name.trim(),
    owner: req.user._id,
    seats: Math.max(1, Math.min(1000, Number(seats) || 5)),
    status: 'inactive',
    members: [{ user: req.user._id, role: 'owner' }],
  });
  await team.populate('members.user', 'name email');
  res.status(201).json(shape(team));
});

// GET /api/teams/mine — teams the caller owns or belongs to.
const myTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user._id }).populate('members.user', 'name email').sort({ createdAt: -1 });
  res.json(teams.map(shape));
});

// GET /api/teams/:id — detail (members only).
const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate('members.user', 'name email');
  if (!team) { res.status(404); throw new Error('Team not found'); }
  if (!team.roleOf(req.user._id) && req.user.role !== 'admin') { res.status(403); throw new Error('Not a member of this team'); }
  res.json(shape(team));
});

// POST /api/teams/:id/members { email } — add a member (owner/admin, seat-checked).
const addMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) { res.status(404); throw new Error('Team not found'); }
  if (!canManage(team, req.user._id) && req.user.role !== 'admin') { res.status(403); throw new Error('Only a team owner/admin can add members'); }
  if (!team.hasFreeSeat()) { res.status(402); throw new Error(`No seats left (${team.seatsUsed()}/${team.seats}). Add seats to invite more.`); }

  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email }).select('_id name email');
  if (!user) { res.status(404); throw new Error('No CodeViz user with that email'); }
  if (team.members.some((m) => String(m.user) === String(user._id))) { res.status(400); throw new Error('Already a member'); }

  team.members.push({ user: user._id, role: 'member' });
  await team.save();
  await team.populate('members.user', 'name email');
  res.status(201).json(shape(team));
});

// DELETE /api/teams/:id/members/:userId — remove a member (owner/admin; owner can't be removed).
const removeMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) { res.status(404); throw new Error('Team not found'); }
  if (!canManage(team, req.user._id) && req.user.role !== 'admin') { res.status(403); throw new Error('Only a team owner/admin can remove members'); }
  if (team.roleOf(req.params.userId) === 'owner') { res.status(400); throw new Error('The owner cannot be removed'); }

  team.members = team.members.filter((m) => String(m.user) !== String(req.params.userId));
  await team.save();
  await team.populate('members.user', 'name email');
  res.json(shape(team));
});

// POST /api/teams/:id/activate { seats? } — platform-admin EDU grant / activation.
// Stands in for the (dormant) billing webhook: flips status to active so members inherit
// the team plan. Once Razorpay is live, the webhook sets this instead.
const activateTeam = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }
  const team = await Team.findById(req.params.id);
  if (!team) { res.status(404); throw new Error('Team not found'); }
  team.status = 'active';
  if (req.body.seats) team.seats = Math.max(team.seatsUsed(), Math.min(1000, Number(req.body.seats)));
  await team.save();
  await team.populate('members.user', 'name email');
  res.json(shape(team));
});

module.exports = { createTeam, myTeams, getTeam, addMember, removeMember, activateTeam };
