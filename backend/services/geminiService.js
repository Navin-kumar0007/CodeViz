const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting - track requests per user
const userRequests = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

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

// Prompt templates
const PROMPTS = {
    hint: (code, language, problem) => `
You are a coding tutor. Give a BRIEF hint (2-3 sentences max) to help the student solve this problem.
Do NOT give the full solution, just guide them.

Problem: ${problem || 'Complete the code'}
Language: ${language}
Current Code:
\`\`\`${language}
${code}
\`\`\`

Give a short, helpful hint:`,

    explainError: (code, error, language) => `
You are a coding tutor. Explain this error in SIMPLE terms (2-3 sentences) for a beginner.
Tell them what's wrong and how to fix it briefly.

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Error: ${error}

Simple explanation:`,

    optimize: (code, language) => `
You are a coding tutor. Suggest 1-2 BRIEF optimizations for this code.
Keep it simple and educational.

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Brief optimization suggestions:`,

    review: (code, language) => `
You are a friendly coding tutor. Give a quick code review (3-4 bullet points max):
- What's good
- What could improve
- Any bugs

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Brief review:`
};

/**
 * Generate AI response using Gemini
 */
const generateResponse = async (prompt, userId) => {
    // Check rate limit
    if (!checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please wait a minute before trying again.');
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('AI service temporarily unavailable. Please try again.');
    }
};

/**
 * Get a hint for the current code
 */
const getHint = async (code, language, problem, userId) => {
    const prompt = PROMPTS.hint(code, language, problem);
    return generateResponse(prompt, userId);
};

/**
 * Explain an error in simple terms
 */
const explainError = async (code, error, language, userId) => {
    const prompt = PROMPTS.explainError(code, error, language);
    return generateResponse(prompt, userId);
};

/**
 * Suggest code optimizations
 */
const suggestOptimizations = async (code, language, userId) => {
    const prompt = PROMPTS.optimize(code, language);
    return generateResponse(prompt, userId);
};

/**
 * Full code review
 */
const reviewCode = async (code, language, userId) => {
    const prompt = PROMPTS.review(code, language);
    return generateResponse(prompt, userId);
};

module.exports = {
    getHint,
    explainError,
    suggestOptimizations,
    reviewCode
};
