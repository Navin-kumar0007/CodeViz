const mongoose = require('mongoose');

const snippetSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true, default: 'javascript' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Snippet', snippetSchema);