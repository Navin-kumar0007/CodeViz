const User = require('../models/User');

const updateStreak = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.streak) {
        user.streak = { current: 0, longest: 0, lastActiveDate: null };
    }

    const lastActive = user.streak.lastActiveDate ? new Date(user.streak.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    // If already checked in today, return
    if (lastActive && lastActive.getTime() === today.getTime()) {
        return { streak: user.streak, updated: false };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
        // Consecutive day
        user.streak.current += 1;
    } else {
        // Streak broken or first time
        user.streak.current = 1;
    }

    // Update longest streak
    if (user.streak.current > user.streak.longest) {
        user.streak.longest = user.streak.current;
    }

    user.streak.lastActiveDate = new Date(); // Use actual time for last active
    await user.save();

    return { streak: user.streak, updated: true };
};

const addXP = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.xp += amount;
    await user.save();

    return { xp: user.xp, level: Math.floor(user.xp / 100) + 1 };
};

const getLeaderboard = async (limit = 10) => {
    return await User.find({})
        .sort({ xp: -1 })
        .limit(limit)
        .select('name xp streak badges');
};

module.exports = {
    updateStreak,
    addXP,
    getLeaderboard
};
