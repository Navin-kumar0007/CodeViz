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
import { RECURSION_PATH } from './recursion';
import { HASHMAPS_PATH } from './hashmaps';
import { QUEUES_PATH } from './queues';
import { STRINGS_PATH } from './strings';
import { TREES_PATH } from './trees';
import { GRAPHS_PATH } from './graphs';
import { DP_PATH } from './dp';
import { HEAPS_PATH } from './heaps';
import { TRIES_PATH } from './tries';
import { TWOPOINTERS_PATH } from './twopointers';
import { BACKTRACKING_PATH } from './backtracking';
import { NODE_PATH } from './node_path';
import { ADV_NODE_PATH } from './adv_node_path';
import { DOCKER_BASICS_PATH } from './docker_basics';
import { DOCKER_COMPOSE_PATH } from './docker_compose';
import { K8S_BASICS_PATH } from './k8s_basics';
import { K8S_ADVANCED_PATH } from './k8s_advanced';
import { ML_MODELS_PATH } from './ml_models';
import { PYTORCH_PATH } from './pytorch_basics';
import { RL_PATH } from './reinforcement_learning';
import { HUGGINGFACE_PATH } from './hugging_face_transformers';
import { AI_ENGINEERING_PATH } from './ai_engineering';
import { REACT_PATH } from './react';
import { GIT_PATH } from './git';
import { SQL_PATH } from './sql';
import { HTML_CSS_PATH } from './html_css';
import { MODERN_JS_PATH } from './modern_js';
import { MONGODB_PATH } from './mongodb';
import { WEB_SECURITY_PATH } from './web_security';
import { SYSTEM_DESIGN_PATH } from './system_design';
import { REST_APIS_PATH } from './rest_apis';
import { DOCKER_DEEP_PATH } from './docker_deep';
import { AWS_PATH } from './aws';
import { LLM_FUNDAMENTALS_PATH } from './llm_fundamentals';
import { SOFTWARE_TESTING_PATH } from './software_testing';

// All available courses (ordered by difficulty / dependency)
export const COURSES = [
    BASICS_PATH,
    HTML_CSS_PATH,
    MODERN_JS_PATH,
    REACT_PATH,
    GIT_PATH,
    SQL_PATH,
    MONGODB_PATH,
    REST_APIS_PATH,
    WEB_SECURITY_PATH,
    SOFTWARE_TESTING_PATH,
    SYSTEM_DESIGN_PATH,
    DOCKER_DEEP_PATH,
    AWS_PATH,
    LLM_FUNDAMENTALS_PATH,
    ARRAYS_PATH,
    STRINGS_PATH,
    SEARCHING_PATH,
    SORTING_PATH,
    RECURSION_PATH,
    HASHMAPS_PATH,
    STACKS_PATH,
    LINKEDLISTS_PATH,
    QUEUES_PATH,
    TREES_PATH,
    GRAPHS_PATH,
    HEAPS_PATH,
    TRIES_PATH,
    TWOPOINTERS_PATH,
    BACKTRACKING_PATH,
    DP_PATH,
    NODE_PATH,
    ADV_NODE_PATH,
    DOCKER_BASICS_PATH,
    DOCKER_COMPOSE_PATH,
    K8S_BASICS_PATH,
    K8S_ADVANCED_PATH,
    ML_MODELS_PATH,
    PYTORCH_PATH,
    RL_PATH,
    HUGGINGFACE_PATH,
    AI_ENGINEERING_PATH
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
