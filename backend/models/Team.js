const mongoose = require('mongoose');
const crypto = require('crypto');

// A team / institution that holds seats and a team plan. Members inherit the team's
// entitlements — but ONLY while the team's billing status is active/trialing, so an
// unbilled team can't be a free upgrade path. Billing linkage (gatewaySubscriptionId)
// stays dormant until live payments are wired; an admin can grant EDU access via activate.
const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan: { type: String, enum: ['team'], default: 'team' },
  seats: { type: Number, default: 5, min: 1 }, // purchased seat count
  status: { type: String, enum: ['inactive', 'trialing', 'active', 'cancelled'], default: 'inactive' },
  members: { type: [memberSchema], default: [] },
  inviteCode: { type: String, unique: true, sparse: true, index: true },
  gatewaySubscriptionId: { type: String, default: null }, // dormant until live billing
}, { timestamps: true });

teamSchema.index({ 'members.user': 1 });

teamSchema.pre('save', function () {
  if (!this.inviteCode) this.inviteCode = crypto.randomBytes(4).toString('hex');
});

teamSchema.methods.isActive = function () {
  return ['active', 'trialing'].includes(this.status);
};
teamSchema.methods.seatsUsed = function () {
  return this.members.length;
};
teamSchema.methods.hasFreeSeat = function () {
  return this.members.length < this.seats;
};
teamSchema.methods.roleOf = function (userId) {
  const m = this.members.find((x) => String(x.user) === String(userId));
  return m ? m.role : null;
};

module.exports = mongoose.model('Team', teamSchema);
