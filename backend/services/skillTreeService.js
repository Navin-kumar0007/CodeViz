const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

/**
 * Skill Tree Calculator
 * Maps user submission history to a visual "RPG Style" skill tree.
 */

const SKILL_DOMAINS = {
    'Arrays': ['Arrays', 'Strings', 'Two Pointers', 'Sliding Window'],
    'Logic': ['Math', 'Bit Manipulation', 'Simulation'],
    'DS': ['Linked List', 'Stack', 'Queue', 'Hash Table', 'Tree', 'Graph', 'Heap'],
    'Algorithms': ['Sorting', 'Searching', 'Recursion', 'Backtracking'],
    'Efficiency': ['Dynamic Programming', 'Greedy', 'Divide and Conquer'],
    'Systems': ['Node.js', 'Streams', 'Buffers', 'Child Process', 'Docker', 'Systems Design', 'IPC', 'Clustering']
};

/**
 * Get the user's skill tree progress
 * @param {string} userId - Mongo ID of the user
 * @returns {Promise<object>} - Skill Tree data (Domain -> Mastery %)
 */
async function getSkillTree(userId) {
    const acceptedSubmissions = await Submission.find({
        user: userId,
        verdict: 'accepted'
    }).distinct('problem');

    if (acceptedSubmissions.length === 0) return { domains: {}, totalPoints: 0 };

    const solvedProblems = await Problem.find({ _id: { $in: acceptedSubmissions } });

    const masteryMap = {};
    Object.keys(SKILL_DOMAINS).forEach(domain => {
        masteryMap[domain] = {
            total: 0,
            solved: 0,
            points: 0,
            tagsMatched: SKILL_DOMAINS[domain]
        };
    });

    // We use a points-based system relative to difficulty.
    solvedProblems.forEach(p => {
        const difficultyMulti = p.difficulty === 'hard' ? 3 : p.difficulty === 'medium' ? 2 : 1;

        // Collect all potential "tags" from the problem (category and companyTags)
        const problemTags = [p.category, ...(p.companyTags || [])]
            .filter(Boolean)
            .map(t => t.toLowerCase());

        Object.keys(SKILL_DOMAINS).forEach(domain => {
            // Check if any of the problem's tags match the SKILL_DOMAINS tags (case-insensitive)
            const domainTags = SKILL_DOMAINS[domain].map(t => t.toLowerCase());
            const hasMatch = problemTags.some(tag => domainTags.includes(tag));

            if (hasMatch) {
                masteryMap[domain].solved += 1;
                masteryMap[domain].points += (10 * difficultyMulti);
            }
        });
    });

    // Normalize mastery to a 0-100 scale for each domain
    // (Assuming 100 points = 'Mastery' for a domain for now)
    const result = {
        domains: {},
        totalPoints: 0
    };

    Object.keys(masteryMap).forEach(domain => {
        const m = masteryMap[domain];
        const percentage = Math.min(100, Math.round((m.points / 100) * 100));
        result.domains[domain] = {
            points: m.points,
            mastery: percentage,
            solvedCount: m.solved,
            title: domain
        };
        result.totalPoints += m.points;
    });

    return result;
}

module.exports = { getSkillTree };
