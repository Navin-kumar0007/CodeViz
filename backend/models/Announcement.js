const mongoose = require('mongoose');

// A class announcement / feed post. Instructors post; the whole class reads.
// Pinned posts float to the top. The core teacher→class communication primitive.
const announcementSchema = new mongoose.Schema(
  {
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, trim: true, maxlength: 160, default: '' },
    body: { type: String, required: true, maxlength: 4000 },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Feed order: pinned first, then newest.
announcementSchema.index({ classroom: 1, pinned: -1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
