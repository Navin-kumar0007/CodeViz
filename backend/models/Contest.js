const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    published: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// upcoming | live | ended
contestSchema.virtual('status').get(function () {
  const now = Date.now();
  if (now < this.startAt.getTime()) return 'upcoming';
  if (now > this.endAt.getTime()) return 'ended';
  return 'live';
});
contestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Contest', contestSchema);
