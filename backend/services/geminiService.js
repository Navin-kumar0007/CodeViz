const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const { getClient } = require('../config/redis');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting - track requests per user
const userRequests = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms
const CACHE_TTL = 3600; // 1 hour in seconds

const checkRateLimit = (userId) => {
    const now = Date.now();
    const userHistory = userRequests.get(userId) || [];

    // Filter requests within the window
    const recentRequests = userHistory.filter(time => now - time < RATE_WINDOW);

    if (recentRequests.length >= RATE_LIMIT) {
        return false; // Rate limited
    }

    // Add current request
    recentRequests.push(now);
    userRequests.set(userId, recentRequests);
    return true;
};

// 🎯 Skill level instructions
const SKILL_CONTEXT = {
    beginner: 'The student is a BEGINNER. Use very simple language, avoid jargon, and explain like they are new to programming. Use analogies where possible.',
    intermediate: 'The student is INTERMEDIATE. They understand basic programming but may struggle with complex concepts. Be clear but you can use standard programming terms.',
    advanced: 'The student is ADVANCED. Be concise and technical. Use proper CS terminology. Focus on edge cases, performance, and best practices.'
};

// 🧒 Teaching style — independent of skill level
const TEACHING_STYLE = {
    standard: '', // Uses SKILL_CONTEXT as-is
    eli5: `\n🧒 IMPORTANT — "Explain Like I'm 5" MODE IS ON:\n- Use everyday analogies: kitchens, toy boxes, building blocks, pizza slices, traffic lights, library shelves\n- Use emojis frequently to make it fun and visual\n- ZERO jargon — if you must use a technical term, immediately explain it with an analogy\n- Short sentences, simple words\n- Compare code concepts to real-life situations a child can understand\n- Be enthusiastic and encouraging like a fun teacher\n- Example: "A variable is like a labeled box 📦 where you store your toys. 'x = 5' means you put 5 toys in the box labeled 'x'!"\n`
};

// Helper to get teaching context
const getTeachingContext = (skillLevel = 'beginner', teachingStyle = 'standard') => {
    const skill = SKILL_CONTEXT[skillLevel] || SKILL_CONTEXT.beginner;
    const style = TEACHING_STYLE[teachingStyle] || '';
    return style ? `${style}\n${skill}` : skill;
};

// Prompt templates (skill-level + teaching-style aware)
const PROMPTS = {
    hint: (code, language, problem, skillLevel = 'beginner', teachingStyle = 'standard') => `
You are a coding tutor. Give a BRIEF hint (2-3 sentences max) to help the student solve this problem.
Do NOT give the full solution, just guide them.
${getTeachingContext(skillLevel, teachingStyle)}

Problem: ${problem || 'Complete the code'}
Language: ${language}
Current Code:
\`\`\`${language}
${code}
\`\`\`

Give a short, helpful hint:`,

    explainError: (code, error, language, skillLevel = 'beginner', teachingStyle = 'standard') => `
You are a coding tutor. Explain this error for the student.
Tell them what's wrong and how to fix it.
${getTeachingContext(skillLevel, teachingStyle)}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Error: ${error}

Explanation:`,

    optimize: (code, language, skillLevel = 'beginner', teachingStyle = 'standard') => `
You are a coding tutor. Suggest 1-2 BRIEF optimizations for this code.
${getTeachingContext(skillLevel, teachingStyle)}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Brief optimization suggestions:`,

    review: (code, language, skillLevel = 'beginner', teachingStyle = 'standard') => `
You are a friendly coding tutor. Give a quick code review (3-4 bullet points max):
- What's good
- What could improve
- Any bugs
${getTeachingContext(skillLevel, teachingStyle)}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Brief review:`,

    // 📊 Algorithm Complexity Analyzer
    complexity: (code, language) => `
Analyze this code and return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "explanation": "Brief 1-2 sentence explanation of why",
  "bestCase": "O(...)",
  "worstCase": "O(...)",
  "dominantOperation": "The operation that dominates runtime",
  "growthData": {
    "labels": [10, 50, 100, 500, 1000],
    "yourCode": [estimated operations for each input size],
    "reference": {
      "O(1)": [1, 1, 1, 1, 1],
      "O(log n)": [3, 6, 7, 9, 10],
      "O(n)": [10, 50, 100, 500, 1000],
      "O(n log n)": [33, 282, 664, 4482, 9965],
      "O(n²)": [100, 2500, 10000, 250000, 1000000]
    }
  }
}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON:`,

    // 🔍 Code Diff Visualizer (optimize with structured diff)
    optimizeWithDiff: (code, language, skillLevel = 'beginner', teachingStyle = 'standard') => `
Optimize this code and return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "optimizedCode": "the full optimized code as a string",
  "changes": [
    { "line": 5, "type": "modified", "before": "old line content", "after": "new line content", "reason": "why this changed" }
  ],
  "summary": "Brief overall summary of what was optimized",
  "complexityBefore": "O(...)",
  "complexityAfter": "O(...)",
  "pattern": "Name of the refactoring or optimization pattern used"
}
${getTeachingContext(skillLevel, teachingStyle)}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON:`,

    // 🤖 Rubric-Based Code Review (0-100 scoring)
    rubricReview: (code, language, skillLevel = 'beginner', teachingStyle = 'standard') => `
You are an expert code reviewer. Score this code on a 0-100 rubric across 5 categories.
Return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "overallScore": <number 0-100>,
  "categories": {
    "readability": { "score": <0-100>, "feedback": "1-2 sentence feedback" },
    "efficiency": { "score": <0-100>, "feedback": "1-2 sentence feedback" },
    "bestPractices": { "score": <0-100>, "feedback": "1-2 sentence feedback" },
    "errorHandling": { "score": <0-100>, "feedback": "1-2 sentence feedback" },
    "codeStructure": { "score": <0-100>, "feedback": "1-2 sentence feedback" }
  },
  "annotations": [
    { "line": <number>, "type": "improvement|warning|good|critical", "message": "specific feedback for this line", "severity": "low|medium|high|critical" }
  ],
  "summary": "2-3 sentence overall assessment"
}
${getTeachingContext(skillLevel, teachingStyle)}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON:`,

    // 🧪 Automated Test Case Generator
    generateTests: (code, language) => `
Analyze this function and generate comprehensive test cases. Include normal cases, edge cases, and boundary cases.
Return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "functionName": "detected function name",
  "description": "what the function does",
  "testCases": [
    {
      "name": "descriptive test name",
      "input": "the input as a string",
      "expected": "expected output as a string",
      "category": "normal|edge|boundary|error",
      "explanation": "why this test case matters"
    }
  ],
  "runnerCode": "complete runnable test code in ${language} that tests the function with all test cases and prints PASS/FAIL for each"
}

Generate at least 6 test cases covering:
- 2+ normal/typical cases
- 2+ edge cases (empty inputs, single elements, etc.)
- 1+ boundary cases (very large/small values)
- 1+ error/invalid input cases

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON:`,

    // 🌐 Multi-Language Code Translator
    translateCode: (code, sourceLanguage, targetLanguage) => `
Translate this code from ${sourceLanguage} to ${targetLanguage}. Maintain the same logic and behavior.
Return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "translatedCode": "the complete translated code",
  "lineMapping": [
    {
      "sourceLine": <source line number>,
      "targetLines": [<target line numbers>],
      "explanation": "brief explanation of how this line translates"
    }
  ],
  "notes": [
    "Important differences between ${sourceLanguage} and ${targetLanguage} relevant to this code"
  ],
  "warnings": [
    "Any potential issues or behavioral differences in the translation"
  ]
}

Source Language: ${sourceLanguage}
Target Language: ${targetLanguage}
Code:
\`\`\`${sourceLanguage}
${code}
\`\`\`

Return ONLY the JSON:`
};

// 🧊 Cache helpers
const generateCacheKey = (type, code, error, language) => {
    const raw = `${type}:${language}:${error || ''}:${code}`;
    const hash = crypto.createHash('md5').update(raw).digest('hex');
    return `ai:cache:${hash}`;
};

const getCachedResponse = async (cacheKey) => {
    try {
        const client = getClient();
        if (!client) return null;
        const cached = await client.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

const setCachedResponse = async (cacheKey, response) => {
    try {
        const client = getClient();
        if (!client) return;
        await client.set(cacheKey, JSON.stringify(response), { EX: CACHE_TTL });
    } catch {
        // Silently fail — caching is optional
    }
};

/**
 * Generate AI response using Gemini (with optional caching and mock fallback)
 */
const generateResponse = async (prompt, userId, cacheKey = null) => {
    // Check rate limit
    if (!checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please wait a minute before trying again.');
    }

    // 🧊 Check cache first
    if (cacheKey) {
        const cached = await getCachedResponse(cacheKey);
        if (cached) {
            console.log('🧊 AI Cache HIT');
            return cached;
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 🧊 Cache the response
        if (cacheKey) {
            await setCachedResponse(cacheKey, text);
        }

        return text;
    } catch (error) {
        console.error('Gemini API error:', error.message);

        // 🚨 Fallback for 429 Quota Exceeded during demo/testing
        if (error.message.includes('429') || error.status === 429) {
            console.log('⚠️ Returning MOCK data due to API quota limit');

            // Return appropriate mock data based on the prompt content
            if (prompt.includes('rubric')) {
                return JSON.stringify({
                    overallScore: 85,
                    categories: {
                        readability: { score: 90, feedback: "Excellent naming and structure." },
                        efficiency: { score: 75, feedback: "Could use a hash map to improve to O(N)." },
                        bestPractices: { score: 85, feedback: "Good use of standard libraries." },
                        errorHandling: { score: 80, feedback: "Add input validation." },
                        codeStructure: { score: 95, feedback: "Very clean functions." }
                    },
                    annotations: [
                        { line: 2, type: "warning", message: "Consider early return here.", severity: "low" },
                        { line: 5, type: "good", message: "Great use of list comprehension!", severity: "low" }
                    ],
                    summary: "(MOCK DATA) Your code is well written but has room for slight efficiency improvements."
                });
            }
            if (prompt.includes('generate tests') || prompt.includes('comprehensive test cases')) {
                return JSON.stringify({
                    functionName: "mockFunction",
                    description: "(MOCK DATA) Generated due to API quota limits.",
                    testCases: [
                        { name: "Normal Case", input: "[1, 2, 3]", expected: "6", category: "normal", explanation: "Standard array" },
                        { name: "Empty Input", input: "[]", expected: "0", category: "edge", explanation: "Handles empty inputs" },
                        { name: "Negative Numbers", input: "[-1, -2, 3]", expected: "0", category: "boundary", explanation: "Checks negative sums" }
                    ],
                    runnerCode: "print('Test 1: PASS')\nprint('Test 2: PASS')\nprint('Test 3: FAIL')"
                });
            }
            if (prompt.includes('Translate this code')) {
                return JSON.stringify({
                    translatedCode: "// (MOCK TRANSLATION)\nfunction mockTranslated() {\n  console.log('Hello from Mock Translator');\n}",
                    lineMapping: [
                        { sourceLine: 1, targetLines: [1, 2], explanation: "Function definition translated" },
                        { sourceLine: 2, targetLines: [3], explanation: "Print statement mapped" }
                    ],
                    notes: ["Used mock data due to API limits."],
                    warnings: ["This is not a real translation."]
                });
            }
            if (prompt.includes('timeComplexity')) {
                return JSON.stringify({
                    timeComplexity: "O(n)", spaceComplexity: "O(1)",
                    explanation: "(MOCK DATA) Loops through once.",
                    bestCase: "O(1)", worstCase: "O(n)", dominantOperation: "Iteration",
                    growthData: { labels: [10, 50, 100], yourCode: [10, 50, 100], reference: { "O(n)": [10, 50, 100] } }
                });
            }
            if (prompt.includes('optimizedCode')) {
                return JSON.stringify({
                    optimizedCode: "// MOCK OPTIMIZED CODE", changes: [], summary: "Mock optimization.",
                    complexityBefore: "O(n^2)", complexityAfter: "O(n)", pattern: "Hash Map"
                });
            }

            return 'AI service mock response (Quota Exceeded).';
        }

        throw new Error('AI service temporarily unavailable. Please try again.');
    }
};

/**
 * Get a hint for the current code
 */
const getHint = async (code, language, problem, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.hint(code, language, problem, skillLevel, teachingStyle);
    return generateResponse(prompt, userId);
};

/**
 * Explain an error in simple terms (CACHED)
 */
const explainError = async (code, error, language, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.explainError(code, error, language, skillLevel, teachingStyle);
    const cacheKey = generateCacheKey('error', code, error, language);
    return generateResponse(prompt, userId, cacheKey);
};

/**
 * Suggest code optimizations
 */
const suggestOptimizations = async (code, language, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.optimize(code, language, skillLevel, teachingStyle);
    return generateResponse(prompt, userId);
};

/**
 * Full code review
 */
const reviewCode = async (code, language, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.review(code, language, skillLevel, teachingStyle);
    return generateResponse(prompt, userId);
};

/**
 * 📊 Analyze algorithm complexity
 */
const analyzeComplexity = async (code, language, userId) => {
    const prompt = PROMPTS.complexity(code, language);
    const cacheKey = generateCacheKey('complexity', code, '', language);
    return generateResponse(prompt, userId, cacheKey);
};

/**
 * 🔍 Optimize with structured diff
 */
const optimizeWithDiff = async (code, language, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.optimizeWithDiff(code, language, skillLevel, teachingStyle);
    return generateResponse(prompt, userId);
};

/**
 * 🤖 Rubric-based code review (0-100 scoring)
 */
const rubricReview = async (code, language, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.rubricReview(code, language, skillLevel, teachingStyle);
    return generateResponse(prompt, userId);
};

/**
 * 🧪 Generate test cases for a function
 */
const generateTests = async (code, language, userId) => {
    const prompt = PROMPTS.generateTests(code, language);
    return generateResponse(prompt, userId);
};

/**
 * 🌐 Translate code between languages
 */
const translateCode = async (code, sourceLanguage, targetLanguage, userId) => {
    const prompt = PROMPTS.translateCode(code, sourceLanguage, targetLanguage);
    const cacheKey = generateCacheKey('translate', code, `${sourceLanguage}-${targetLanguage}`, sourceLanguage);
    return generateResponse(prompt, userId, cacheKey);
};

module.exports = {
    getHint,
    explainError,
    suggestOptimizations,
    reviewCode,
    analyzeComplexity,
    optimizeWithDiff,
    rubricReview,
    generateTests,
    translateCode
};
