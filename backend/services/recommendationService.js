const LearningProgress = require('../models/LearningProgress');

/**
 * Recommendation Service
 * Analyzes quiz performance to identify weak areas and recommend lessons
 */

// Topic difficulty mappings
const TOPIC_DIFFICULTY = {
    'basics': 1,
    'arrays': 2,
    'searching': 2,
    'sorting': 3,
    'stacks': 3,
    'linkedlists': 4,
    'trees': 5,
    'graphs': 5
};

// Related topics for recommendations
const RELATED_TOPICS = {
    'basics': ['arrays'],
    'arrays': ['searching', 'sorting'],
    'searching': ['arrays', 'sorting'],
    'sorting': ['arrays', 'searching'],
    'stacks': ['linkedlists'],
    'linkedlists': ['stacks', 'trees'],
    'trees': ['linkedlists', 'graphs'],
    'graphs': ['trees']
};

// Minimum score threshold (below this = weak area)
const WEAK_SCORE_THRESHOLD = 70;

/**
 * Analyze user's quiz performance to find weak areas
 */
const analyzeWeakAreas = (pathProgress) => {
    const weakAreas = [];
    const strongAreas = [];

    if (!pathProgress) return { weakAreas: [], strongAreas: [] };

    pathProgress.forEach((progress, topic) => {
        if (progress.quizScores && progress.quizScores.size > 0) {
            let totalScore = 0;
            let count = 0;

            progress.quizScores.forEach((score) => {
                totalScore += score;
                count++;
            });

            const avgScore = count > 0 ? totalScore / count : 0;

            if (avgScore < WEAK_SCORE_THRESHOLD) {
                weakAreas.push({
                    topic,
                    avgScore: Math.round(avgScore),
                    difficulty: TOPIC_DIFFICULTY[topic] || 3
                });
            } else {
                strongAreas.push({
                    topic,
                    avgScore: Math.round(avgScore)
                });
            }
        }
    });

    // Sort weak areas by difficulty (easier topics first for remediation)
    weakAreas.sort((a, b) => a.difficulty - b.difficulty);

    return { weakAreas, strongAreas };
};

/**
 * Generate personalized lesson recommendations
 */
const getRecommendations = async (userId) => {
    try {
        const progress = await LearningProgress.findOne({ userId });

        if (!progress) {
            // New user - recommend starting from basics
            return {
                recommendations: [
                    { topic: 'basics', reason: 'Start your learning journey!', priority: 'high' },
                    { topic: 'arrays', reason: 'Master the fundamentals', priority: 'medium' }
                ],
                weakAreas: [],
                strongAreas: [],
                nextSteps: ['Complete the Basics course to unlock more content']
            };
        }

        const { weakAreas, strongAreas } = analyzeWeakAreas(progress.pathProgress);
        const recommendations = [];
        const nextSteps = [];

        // Priority 1: Address weak areas
        weakAreas.forEach((weak) => {
            recommendations.push({
                topic: weak.topic,
                reason: `Improve your ${weak.topic} skills (current: ${weak.avgScore}%)`,
                priority: 'high'
            });
            nextSteps.push(`Review ${weak.topic} lessons and retake quizzes`);
        });

        // Priority 2: Suggest related topics from strong areas
        strongAreas.forEach((strong) => {
            const related = RELATED_TOPICS[strong.topic] || [];
            related.forEach((relatedTopic) => {
                // Only recommend if not already in recommendations
                if (!recommendations.find(r => r.topic === relatedTopic)) {
                    const existingProgress = progress.pathProgress.get(relatedTopic);
                    const hasCompleted = existingProgress?.completed?.length > 0;

                    if (!hasCompleted) {
                        recommendations.push({
                            topic: relatedTopic,
                            reason: `Based on your ${strong.topic} success`,
                            priority: 'medium'
                        });
                    }
                }
            });
        });

        // Priority 3: Suggest next difficulty level
        const completedTopics = [];
        progress.pathProgress.forEach((p, topic) => {
            if (p.completed && p.completed.length > 0) {
                completedTopics.push(topic);
            }
        });

        const highestDifficulty = Math.max(...completedTopics.map(t => TOPIC_DIFFICULTY[t] || 1), 0);

        // Find topics at next difficulty level
        Object.entries(TOPIC_DIFFICULTY).forEach(([topic, difficulty]) => {
            if (difficulty === highestDifficulty + 1 && !completedTopics.includes(topic)) {
                if (!recommendations.find(r => r.topic === topic)) {
                    recommendations.push({
                        topic,
                        reason: 'Challenge yourself with advanced content',
                        priority: 'low'
                    });
                }
            }
        });

        // Limit recommendations
        const limitedRecs = recommendations.slice(0, 5);

        return {
            recommendations: limitedRecs,
            weakAreas,
            strongAreas,
            nextSteps: nextSteps.slice(0, 3),
            stats: {
                totalLessons: progress.lessonsCompleted || 0,
                totalScore: progress.totalScore || 0
            }
        };
    } catch (error) {
        console.error('Recommendation service error:', error);
        throw error;
    }
};

/**
 * Get difficulty level for a user based on performance
 */
const getUserDifficulty = async (userId) => {
    try {
        const progress = await LearningProgress.findOne({ userId });

        if (!progress) return 'beginner';

        const { weakAreas, strongAreas } = analyzeWeakAreas(progress.pathProgress);

        // Calculate average score across all topics
        let totalAvg = 0;
        const allAreas = [...weakAreas, ...strongAreas];

        if (allAreas.length > 0) {
            totalAvg = allAreas.reduce((sum, a) => sum + a.avgScore, 0) / allAreas.length;
        }

        // Determine difficulty level
        if (totalAvg >= 90) return 'advanced';
        if (totalAvg >= 75) return 'intermediate';
        if (totalAvg >= 50) return 'developing';
        return 'beginner';
    } catch (error) {
        console.error('Get difficulty error:', error);
        return 'beginner';
    }
};

module.exports = {
    analyzeWeakAreas,
    getRecommendations,
    getUserDifficulty,
    TOPIC_DIFFICULTY,
    WEAK_SCORE_THRESHOLD
};
