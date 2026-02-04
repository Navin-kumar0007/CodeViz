const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },

    // 🎮 Gamification
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null }
    },
    xp: { type: Number, default: 0 },
    badges: [{
      id: String,
      earnedAt: { type: Date, default: Date.now }
    }],
    completedChallenges: [{
      challengeId: String,
      completedAt: { type: Date, default: Date.now },
      score: Number
    }]
  },
  { timestamps: true }
);

// 🔒 Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔓 Method to check password on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);