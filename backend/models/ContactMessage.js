const mongoose = require('mongoose');

/** Inbound contact-form message. */
const contactSchema = mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    subject: { type: String, default: 'General', maxlength: 140 },
    message: { type: String, required: true, maxlength: 4000 },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactSchema);
