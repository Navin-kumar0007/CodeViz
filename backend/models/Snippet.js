const mongoose = require('mongoose');

const snippetSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true, default: 'javascript' },
    isShared: { type: Boolean, default: false },
    sharedAt: { type: Date }
  },
  { timestamps: true }
);

// ⚡️ INDEXES for Performance
snippetSchema.index({ userId: 1 }); // Faster "My Snippets" load
snippetSchema.index({ isShared: 1 }); // Faster "Public Feed" load
snippetSchema.index({ isShared: 1, createdAt: -1 }); // Faster "Latest Shared" feed

module.exports = mongoose.model('Snippet', snippetSchema);