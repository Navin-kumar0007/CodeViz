const Submission = require('../models/Submission');
const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User');

/**
 * DNA Radar Service
 * Generates a holistic "Student DNA" signature or radar chart data.
 */

async function getStudentDNA(userId) {
    const user = await User.findById(userId);
    const progress = await LearningProgress.findOne({ userId });
    const submissions = await Submission.find({ user: userId });

    if (!user || !submissions.length) {
        return [
            { subject: 'Consistency', A: 0 },
            { subject: 'Accuracy', A: 0 },
            { subject: 'Complexity', A: 0 },
            { subject: 'Breadth', A: 0 },
            { subject: 'Speed', A: 0 }
        ];
    }

    // 1. Consistency (Active days in last 30 days / 30)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeDays = new Set(
        submissions
            .filter(s => s.createdAt > thirtyDaysAgo)
            .map(s => s.createdAt.toDateString())
    ).size;
    const consistency = Math.min(100, Math.round((activeDays / 20) * 100)); // 20 days = 100% consistency

    // 2. Accuracy (Accepted / Total)
    const acceptedCount = submissions.filter(s => s.verdict === 'accepted').length;
    const accuracy = Math.round((acceptedCount / submissions.length) * 100);

    // 3. Complexity (Average difficulty of accepted problems)
    // Assuming difficulty is stored or we mapped it. 
    // For now, use a mix of points and challenge completion.
    const complexityScore = Math.min(100, (user.xp / 1000) * 100);

    // 4. Breadth (Number of unique tags solved)
    const uniqueTags = new Set();
    // This requires joining with Problems, let's assume we have them in the context of recent work
    // Or just use the number of completed lessons as a proxy for breadth
    const breadth = Math.min(100, (progress?.lessonsCompleted || 0) * 5);

    // 5. Speed (Dummy for now, or based on timeSpent if available in submissions)
    const speed = 75; // Baseline

    return [
        { subject: 'Consistency', A: consistency },
        { subject: 'Accuracy', A: accuracy },
        { subject: 'Complexity', A: Math.round(complexityScore) },
        { subject: 'Breadth', A: breadth },
        { subject: 'Speed', A: speed }
    ];
}

module.exports = { getStudentDNA };
