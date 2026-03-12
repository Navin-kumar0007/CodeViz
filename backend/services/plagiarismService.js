/**
 * 🔍 Plagiarism Detection Service
 * Uses winnowing (fingerprinting) + normalized Levenshtein distance
 * to detect code similarity between student submissions
 */

// ═══ Text Normalization ═══
// Strips whitespace, comments, variable names to find structural similarity
const normalize = (code) => {
    return code
        .replace(/\/\/.*$/gm, '')           // remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')   // remove multi-line comments
        .replace(/#.*$/gm, '')              // remove Python comments
        .replace(/\s+/g, ' ')              // normalize whitespace
        .replace(/['"]/g, '')              // remove quotes
        .toLowerCase()
        .trim();
};

// ═══ K-gram generation ═══
const kgrams = (text, k = 5) => {
    const grams = [];
    for (let i = 0; i <= text.length - k; i++) {
        grams.push(text.substring(i, i + k));
    }
    return grams;
};

// ═══ Simple string hash ═══
const hash = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h = ((h << 5) - h) + ch;
        h |= 0; // Convert to 32bit int
    }
    return h;
};

// ═══ Winnowing Algorithm ═══
// Selects representative fingerprints from hashed k-grams
const winnow = (text, k = 5, windowSize = 4) => {
    const grams = kgrams(text, k);
    const hashes = grams.map(g => hash(g));

    if (hashes.length < windowSize) {
        return new Set(hashes);
    }

    const fingerprints = new Set();
    for (let i = 0; i <= hashes.length - windowSize; i++) {
        const window = hashes.slice(i, i + windowSize);
        const minHash = Math.min(...window);
        fingerprints.add(minHash);
    }
    return fingerprints;
};

// ═══ Jaccard Similarity ═══
// Measures overlap between two fingerprint sets
const jaccardSimilarity = (setA, setB) => {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
};

// ═══ Levenshtein Distance ═══
const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Truncate very long strings
    const maxLen = 2000;
    const sa = a.length > maxLen ? a.substring(0, maxLen) : a;
    const sb = b.length > maxLen ? b.substring(0, maxLen) : b;

    const matrix = [];
    for (let i = 0; i <= sb.length; i++) matrix[i] = [i];
    for (let j = 0; j <= sa.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= sb.length; i++) {
        for (let j = 1; j <= sa.length; j++) {
            if (sb.charAt(i - 1) === sa.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[sb.length][sa.length];
};

const normalizedLevenshtein = (a, b) => {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 0;
    return 1 - (levenshtein(a, b) / maxLen);
};

// ═══ Compare Two Submissions ═══
const compareTwo = (code1, code2) => {
    const norm1 = normalize(code1);
    const norm2 = normalize(code2);

    // 1. Winnowing fingerprint similarity
    const fp1 = winnow(norm1);
    const fp2 = winnow(norm2);
    const fingerprintSimilarity = jaccardSimilarity(fp1, fp2);

    // 2. Normalized Levenshtein similarity
    const levenshteinSimilarity = normalizedLevenshtein(norm1, norm2);

    // Combined score (weighted average)
    const similarity = Math.round(
        (fingerprintSimilarity * 0.6 + levenshteinSimilarity * 0.4) * 100
    );

    return {
        similarity,
        fingerprintSimilarity: Math.round(fingerprintSimilarity * 100),
        levenshteinSimilarity: Math.round(levenshteinSimilarity * 100),
        flagged: similarity >= 70 // threshold for flagging
    };
};

// ═══ Compare All Submissions Against Each Other ═══
const compareAll = (submissions) => {
    // submissions: [{ studentId, studentName, code }]
    const results = [];
    const pairMap = {};

    for (let i = 0; i < submissions.length; i++) {
        for (let j = i + 1; j < submissions.length; j++) {
            const s1 = submissions[i];
            const s2 = submissions[j];

            if (!s1.code || !s2.code) continue;

            const comparison = compareTwo(s1.code, s2.code);
            const pair = {
                student1: { id: s1.studentId, name: s1.studentName },
                student2: { id: s2.studentId, name: s2.studentName },
                ...comparison
            };

            results.push(pair);

            // Track max similarity per student
            [s1.studentId, s2.studentId].forEach(id => {
                if (!pairMap[id] || pairMap[id].similarity < comparison.similarity) {
                    pairMap[id] = comparison;
                }
            });
        }
    }

    // Sort by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);

    // Summary
    const flaggedCount = results.filter(r => r.flagged).length;
    const avgSimilarity = results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.similarity, 0) / results.length)
        : 0;

    return {
        pairs: results,
        summary: {
            totalPairs: results.length,
            flaggedPairs: flaggedCount,
            avgSimilarity,
            maxSimilarity: results.length > 0 ? results[0].similarity : 0,
            suspiciousStudents: [...new Set(
                results.filter(r => r.flagged).flatMap(r => [r.student1.name, r.student2.name])
            )]
        }
    };
};

module.exports = { compareTwo, compareAll, normalize };
