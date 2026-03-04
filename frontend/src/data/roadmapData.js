/**
 * Roadmap Data — Interactive Skill Tree definitions
 * 3 career paths with nodes and prerequisites
 */

export const CAREER_PATHS = [
    { id: 'sde', label: 'SDE Interview Prep', icon: '💻', color: '#667eea', description: 'Master DSA for software engineering interviews' },
    { id: 'dsml', label: 'DS / ML Engineer', icon: '🤖', color: '#48bb78', description: 'Focus on algorithms used in data science & ML' },
    { id: 'system', label: 'System Design', icon: '🏗️', color: '#ed8936', description: 'Algorithms & patterns for scalable systems' }
];

// Shared node pool — paths reference these nodes
const NODES = [
    // ─── Foundations (Row 1) ───
    { id: 'variables', label: 'Variables & Types', icon: '📦', category: 'Foundations', lessons: ['variables-101'], row: 0, col: 0, estimatedMinutes: 10 },
    { id: 'loops', label: 'Loops & Control', icon: '🔁', category: 'Foundations', lessons: ['loops-101'], row: 0, col: 1, prerequisites: ['variables'], estimatedMinutes: 10 },
    { id: 'functions', label: 'Functions', icon: '⚙️', category: 'Foundations', lessons: ['functions-101'], row: 0, col: 2, prerequisites: ['loops'], estimatedMinutes: 12 },
    { id: 'recursion', label: 'Recursion', icon: '🪆', category: 'Foundations', lessons: ['recursion-101'], row: 0, col: 3, prerequisites: ['functions'], estimatedMinutes: 15 },

    // ─── Data Structures (Row 2) ───
    { id: 'arrays', label: 'Arrays', icon: '📚', category: 'Data Structures', lessons: ['arrays-basics', 'arrays-2pointer'], row: 1, col: 0, prerequisites: ['loops'], estimatedMinutes: 15 },
    { id: 'strings', label: 'Strings', icon: '🔤', category: 'Data Structures', lessons: ['strings-basics'], row: 1, col: 1, prerequisites: ['arrays'], estimatedMinutes: 12 },
    { id: 'linked-list', label: 'Linked Lists', icon: '🔗', category: 'Data Structures', lessons: ['ll-singly', 'll-doubly'], row: 1, col: 2, prerequisites: ['arrays'], estimatedMinutes: 20 },
    { id: 'stacks', label: 'Stacks', icon: '📥', category: 'Data Structures', lessons: ['stacks-101'], row: 1, col: 3, prerequisites: ['arrays'], estimatedMinutes: 12 },
    { id: 'queues', label: 'Queues', icon: '🚶', category: 'Data Structures', lessons: ['queues-101'], row: 1, col: 4, prerequisites: ['arrays'], estimatedMinutes: 12 },
    { id: 'hashmaps', label: 'Hash Maps', icon: '🗺️', category: 'Data Structures', lessons: ['hashmap-101'], row: 1, col: 5, prerequisites: ['arrays'], estimatedMinutes: 15 },

    // ─── Sorting & Searching (Row 3) ───
    { id: 'sorting-basic', label: 'Basic Sorting', icon: '📊', category: 'Sorting', lessons: ['bubble-sort', 'selection-sort', 'insertion-sort'], row: 2, col: 0, prerequisites: ['arrays'], estimatedMinutes: 20 },
    { id: 'sorting-adv', label: 'Advanced Sorting', icon: '⚡', category: 'Sorting', lessons: ['merge-sort', 'quick-sort'], row: 2, col: 1, prerequisites: ['sorting-basic', 'recursion'], estimatedMinutes: 20 },
    { id: 'binary-search', label: 'Binary Search', icon: '🔍', category: 'Searching', lessons: ['binary-search-101'], row: 2, col: 2, prerequisites: ['sorting-basic'], estimatedMinutes: 15 },
    { id: 'two-pointer', label: 'Two Pointers', icon: '👉👈', category: 'Techniques', lessons: ['two-ptr-101'], row: 2, col: 3, prerequisites: ['arrays', 'sorting-basic'], estimatedMinutes: 15 },
    { id: 'sliding-window', label: 'Sliding Window', icon: '🪟', category: 'Techniques', lessons: ['sliding-window-101'], row: 2, col: 4, prerequisites: ['arrays'], estimatedMinutes: 15 },

    // ─── Trees & Graphs (Row 4) ───
    { id: 'trees', label: 'Binary Trees', icon: '🌳', category: 'Trees', lessons: ['tree-basics', 'tree-traversal'], row: 3, col: 0, prerequisites: ['recursion', 'linked-list'], estimatedMinutes: 20 },
    { id: 'bst', label: 'BST', icon: '🌲', category: 'Trees', lessons: ['bst-101'], row: 3, col: 1, prerequisites: ['trees'], estimatedMinutes: 15 },
    { id: 'heaps', label: 'Heaps', icon: '⛰️', category: 'Trees', lessons: ['heap-101'], row: 3, col: 2, prerequisites: ['trees'], estimatedMinutes: 15 },
    { id: 'graphs', label: 'Graphs', icon: '🕸️', category: 'Graphs', lessons: ['graph-basics', 'bfs-dfs'], row: 3, col: 3, prerequisites: ['queues', 'stacks'], estimatedMinutes: 25 },
    { id: 'graph-adv', label: 'Advanced Graphs', icon: '🗺️', category: 'Graphs', lessons: ['dijkstra', 'topological'], row: 3, col: 4, prerequisites: ['graphs', 'heaps'], estimatedMinutes: 25 },

    // ─── Advanced (Row 5) ───
    { id: 'dp-basic', label: 'Basic DP', icon: '🧩', category: 'Dynamic Programming', lessons: ['dp-intro', 'fibonacci-dp'], row: 4, col: 0, prerequisites: ['recursion', 'arrays'], estimatedMinutes: 20 },
    { id: 'dp-adv', label: 'Advanced DP', icon: '🏆', category: 'Dynamic Programming', lessons: ['knapsack', 'lcs'], row: 4, col: 1, prerequisites: ['dp-basic'], estimatedMinutes: 25 },
    { id: 'greedy', label: 'Greedy', icon: '🎯', category: 'Advanced', lessons: ['greedy-101'], row: 4, col: 2, prerequisites: ['sorting-adv'], estimatedMinutes: 15 },
    { id: 'backtracking', label: 'Backtracking', icon: '🔙', category: 'Advanced', lessons: ['backtracking-101'], row: 4, col: 3, prerequisites: ['recursion', 'trees'], estimatedMinutes: 20 },
    { id: 'bit-manipulation', label: 'Bit Manipulation', icon: '🔢', category: 'Advanced', lessons: ['bits-101'], row: 4, col: 4, prerequisites: ['functions'], estimatedMinutes: 15 },
];

// Career path node sets — reference node IDs
export const PATH_NODES = {
    sde: [
        'variables', 'loops', 'functions', 'recursion',
        'arrays', 'strings', 'linked-list', 'stacks', 'queues', 'hashmaps',
        'sorting-basic', 'sorting-adv', 'binary-search', 'two-pointer', 'sliding-window',
        'trees', 'bst', 'heaps', 'graphs', 'graph-adv',
        'dp-basic', 'dp-adv', 'greedy', 'backtracking', 'bit-manipulation'
    ],
    dsml: [
        'variables', 'loops', 'functions', 'recursion',
        'arrays', 'strings', 'hashmaps',
        'sorting-basic', 'sorting-adv', 'binary-search',
        'trees', 'heaps', 'graphs', 'graph-adv',
        'dp-basic', 'dp-adv', 'greedy'
    ],
    system: [
        'variables', 'loops', 'functions',
        'arrays', 'strings', 'hashmaps',
        'stacks', 'queues',
        'sorting-basic', 'binary-search',
        'trees', 'bst', 'heaps', 'graphs', 'graph-adv',
        'dp-basic', 'greedy'
    ]
};

export const getNodesForPath = (pathId) => {
    const nodeIds = PATH_NODES[pathId] || PATH_NODES.sde;
    return NODES.filter(n => nodeIds.includes(n.id));
};

export const getEdgesForPath = (pathId) => {
    const nodes = getNodesForPath(pathId);
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = [];

    nodes.forEach(node => {
        if (node.prerequisites) {
            node.prerequisites.forEach(prereq => {
                if (nodeIds.has(prereq)) {
                    edges.push({ from: prereq, to: node.id });
                }
            });
        }
    });

    return edges;
};

// Category colors
export const CATEGORY_COLORS = {
    'Foundations': '#667eea',
    'Data Structures': '#48bb78',
    'Sorting': '#ed8936',
    'Searching': '#4299e1',
    'Techniques': '#f6ad55',
    'Trees': '#38b2ac',
    'Graphs': '#e53e3e',
    'Dynamic Programming': '#9f7aea',
    'Advanced': '#f56565'
};
