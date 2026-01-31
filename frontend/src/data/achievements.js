/**
 * Achievements System
 * Defines all achievements and helper functions
 */

export const ACHIEVEMENTS = [
    // Learning milestones
    {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'milestone'
    },
    {
        id: 'five_lessons',
        title: 'Getting Started',
        description: 'Complete 5 lessons',
        icon: '⭐',
        category: 'milestone'
    },
    {
        id: 'ten_lessons',
        title: 'On a Roll',
        description: 'Complete 10 lessons',
        icon: '🔥',
        category: 'milestone'
    },
    {
        id: 'twenty_lessons',
        title: 'Dedicated Learner',
        description: 'Complete 20 lessons',
        icon: '📚',
        category: 'milestone'
    },

    // Course completion achievements
    {
        id: 'basics_master',
        title: 'Basics Master',
        description: 'Complete the Programming Basics path',
        icon: '🔰',
        category: 'course',
        courseId: 'basics'
    },
    {
        id: 'array_pro',
        title: 'Array Pro',
        description: 'Complete the Arrays & Lists path',
        icon: '📊',
        category: 'course',
        courseId: 'arrays'
    },
    {
        id: 'search_expert',
        title: 'Search Expert',
        description: 'Complete the Searching Algorithms path',
        icon: '🔍',
        category: 'course',
        courseId: 'searching'
    },
    {
        id: 'sort_wizard',
        title: 'Sort Wizard',
        description: 'Complete the Sorting Algorithms path',
        icon: '📈',
        category: 'course',
        courseId: 'sorting'
    },
    {
        id: 'linkedlist_guru',
        title: 'LinkedList Guru',
        description: 'Complete the Linked Lists path',
        icon: '🔗',
        category: 'course',
        courseId: 'linkedlists'
    },
    {
        id: 'stack_ninja',
        title: 'Stack Ninja',
        description: 'Complete the Stacks path',
        icon: '📚',
        category: 'course',
        courseId: 'stacks'
    },

    // Quiz achievements
    {
        id: 'perfect_quiz',
        title: 'Perfect Score',
        description: 'Score 100% on any quiz',
        icon: '💯',
        category: 'quiz'
    },
    {
        id: 'quiz_streak',
        title: 'Quiz Streak',
        description: 'Get 100% on 3 quizzes in a row',
        icon: '🏆',
        category: 'quiz'
    }
];

/**
 * Check achievements based on current progress
 * Returns array of newly unlocked achievement IDs
 */
export const checkAchievements = (progress, unlockedAchievements = []) => {
    const newAchievements = [];

    // Count total completed lessons
    let totalCompleted = 0;
    Object.values(progress).forEach(pathProgress => {
        if (pathProgress?.completed) {
            totalCompleted += pathProgress.completed.length;
        }
    });

    // Check milestone achievements
    if (totalCompleted >= 1 && !unlockedAchievements.includes('first_lesson')) {
        newAchievements.push('first_lesson');
    }
    if (totalCompleted >= 5 && !unlockedAchievements.includes('five_lessons')) {
        newAchievements.push('five_lessons');
    }
    if (totalCompleted >= 10 && !unlockedAchievements.includes('ten_lessons')) {
        newAchievements.push('ten_lessons');
    }
    if (totalCompleted >= 20 && !unlockedAchievements.includes('twenty_lessons')) {
        newAchievements.push('twenty_lessons');
    }

    // Check course completion achievements
    const courseAchievements = ACHIEVEMENTS.filter(a => a.category === 'course');
    courseAchievements.forEach(achievement => {
        if (unlockedAchievements.includes(achievement.id)) return;

        const pathProgress = progress[achievement.courseId];
        if (pathProgress?.completed) {
            // Need to check if path is fully complete (would need course data)
            // For now, we'll trigger this from the completion handler
        }
    });

    return newAchievements;
};

/**
 * Get achievement by ID
 */
export const getAchievement = (id) => {
    return ACHIEVEMENTS.find(a => a.id === id);
};

/**
 * Get all achievements by category
 */
export const getAchievementsByCategory = (category) => {
    return ACHIEVEMENTS.filter(a => a.category === category);
};
