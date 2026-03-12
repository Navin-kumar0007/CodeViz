const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const cacheService = require('./cacheService');

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

// Import shared prompts and context
const { PROMPTS, getTeachingContext } = require('./aiPrompts');

// 🧊 Cache helpers
const generateCacheKey = (type, code, error, language) => {
    const raw = `${type}:${language}:${error || ''}:${code}`;
    const hash = crypto.createHash('md5').update(raw).digest('hex');
    return `ai:cache:${hash}`;
};

// Multi-Tier Cache helper
const getCachedResponse = async (cacheKey) => {
    return await cacheService.get(cacheKey);
};

const setCachedResponse = async (cacheKey, response) => {
    await cacheService.set(cacheKey, response);
};

/**
 * Generate AI response using Gemini (with multi-model rotation and multi-key support)
 */
const generateResponse = async (prompt, userId, cacheKey = null) => {
    // 1. Check Rate Limit (Local)
    if (!checkRateLimit(userId)) {
        throw new Error('Local rate limit exceeded. Please wait a minute.');
    }

    // 2. Multi-Tier Cache Check
    if (cacheKey) {
        const cached = await getCachedResponse(cacheKey);
        if (cached) return cached;
    }

    // 3. Prepare Keys and Models for rotation
    const keys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    let lastError = null;

    // 🔄 Rotation Loop: Try every Key with every Model before giving up
    for (const key of keys) {
        const rotationAI = new GoogleGenerativeAI(key);

        for (const modelName of models) {
            try {
                console.log(`🤖 Gemini [${modelName}]: Attempting request...`);
                // ... logic continues ...
                const model = rotationAI.getGenerativeModel({ model: modelName });

                // Set a reasonable timeout for the AI promise
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    if (cacheKey) await setCachedResponse(cacheKey, text);
                    return text;
                }
            } catch (error) {
                lastError = error;
                const isQuotaError = error.message.includes('429') || error.status === 429;

                if (isQuotaError) {
                    console.warn(`⚠️ Gemini [${modelName}] Quota Exceeded. Rotating...`);
                    continue; // Try next model/key
                }

                console.error(`❌ Gemini [${modelName}] Error:`, error.message);
                // If it's a safety error or block, we might want to continue or stop
                if (error.message.includes('Safety')) continue;

                break; // Non-quota error, move to next key or throw
            }
        }
    }

    // If we're here, all Gemini attempts failed
    if (lastError?.message?.includes('429')) {
        console.error('🚫 All Gemini Models/Keys exhausted. Relaying 429 to Orchestrator.');
        throw lastError; // Orchestrator will catch this and try fallback providers
    }

    throw new Error('Gemini service temporarily unavailable. Please try again.');
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

/**
 * 🎙️ Narrate code line by line
 */
const narrateCode = async (code, language, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.narrateCode(code, language, skillLevel, teachingStyle);
    const cacheKey = generateCacheKey('narrate', code, '', language);
    return generateResponse(prompt, userId, cacheKey);
};

/**
 * 🕵️ Detect AI Authorship
 */
const detectAI = async (code, language, userId) => {
    const prompt = PROMPTS.detectAI(code, language);
    const cacheKey = generateCacheKey('detectAI', code, '', language);
    return generateResponse(prompt, userId, cacheKey);
};

/**
 * 👻 AI Ghost Assistant (Proactive nudge)
 */
const ghostHint = async (code, language, errors, timeSpent, userId, skillLevel, teachingStyle) => {
    const prompt = PROMPTS.ghostHint(code, language, errors, timeSpent, skillLevel, teachingStyle);
    return generateResponse(prompt, userId);
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
    translateCode,
    narrateCode,
    detectAI,
    ghostHint
};
