/**
 * Course Data Registry
 * Central hub for all learning paths and helper functions
 */

import { BASICS_PATH } from './basics';
import { ARRAYS_PATH } from './arrays';
import { SEARCHING_PATH } from './searching';
import { SORTING_PATH } from './sorting';
import { LINKEDLISTS_PATH } from './linkedlists';
import { STACKS_PATH } from './stacks';

// All available courses
export const COURSES = [
    BASICS_PATH,
    ARRAYS_PATH,
    SEARCHING_PATH,
    SORTING_PATH,
    LINKEDLISTS_PATH,
    STACKS_PATH
];

// Calculate progress for a specific path
export const getPathProgress = (pathId, progress) => {
    const path = COURSES.find(p => p.id === pathId);
    if (!path) return 0;

    const pathProgress = progress[pathId];
    if (!pathProgress || !pathProgress.completed) return 0;

    return Math.round((pathProgress.completed.length / path.lessons.length) * 100);
};

// Check if a path is unlocked (prerequisites completed)
export const isPathUnlocked = (pathId, progress) => {
    const path = COURSES.find(p => p.id === pathId);
    if (!path) return false;

    // No prerequisites means always unlocked
    if (!path.prerequisites || path.prerequisites.length === 0) return true;

    // Check if all prerequisites are 100% complete
    return path.prerequisites.every(prereqId => {
        const prereqProgress = getPathProgress(prereqId, progress);
        return prereqProgress === 100;
    });
};

// Calculate total progress across all paths
export const getTotalProgress = (progress) => {
    if (!progress || Object.keys(progress).length === 0) return 0;

    let totalLessons = 0;
    let completedLessons = 0;

    COURSES.forEach(course => {
        totalLessons += course.lessons.length;
        const pathProgress = progress[course.id];
        if (pathProgress && pathProgress.completed) {
            completedLessons += pathProgress.completed.length;
        }
    });

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

// Get next recommended lesson
export const getNextLesson = (progress) => {
    for (const course of COURSES) {
        // Skip locked courses
        if (!isPathUnlocked(course.id, progress)) continue;

        const pathProgress = progress[course.id];
        if (!pathProgress || pathProgress.completed.length < course.lessons.length) {
            // Find first incomplete lesson
            const completedIds = pathProgress?.completed || [];
            const nextLesson = course.lessons.find(l => !completedIds.includes(l.id));
            if (nextLesson) {
                return { path: course, lesson: nextLesson };
            }
        }
    }
    return null;
};
