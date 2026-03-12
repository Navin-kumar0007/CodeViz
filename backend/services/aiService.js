const geminiProvider = require('./geminiService');
const groqProvider = require('./groqService');
const crypto = require('crypto');
const { getClient } = require('../config/redis');

// Configuration for provider priority
const PROVIDER_CHAIN = ['gemini', 'openai', 'groq', 'mock_secondary'];

/**
 * AI Service Orchestrator
 * Automatically falls back to secondary providers if the primary fails.
 */

// Mapping of functions to their provider counterparts
const AI_METHODS = [
    'getHint', 'explainError', 'suggestOptimizations', 'reviewCode',
    'analyzeComplexity', 'optimizeWithDiff', 'rubricReview', 'generateTests',
    'translateCode', 'narrateCode', 'detectAI', 'ghostHint'
];

const aiService = {};

// Dynamically build the orchestrator methods
AI_METHODS.forEach(method => {
    aiService[method] = async (...args) => {
        let lastError = null;

        for (const provider of PROVIDER_CHAIN) {
            try {
                // If it's gemini, it has its own internal rotation
                if (provider === 'gemini') {
                    console.log(`🤖 AI Orchestrator: Attempting [${method}] with provider [${provider}]`);
                    return await geminiProvider[method](...args);
                }

                if (provider === 'openai') {
                    if (process.env.OPENAI_API_KEY) {
                        console.log(`🤖 AI Orchestrator: Attempting [${method}] with provider [openai]`);
                        // return await openaiProvider[method](...args);
                    } else {
                        // Silent skip for optional providers
                    }
                }

                if (provider === 'groq') {
                    const groqKey = process.env.GROQ_API_KEY;
                    console.log(`🔍 DEBUG: GROQ_API_KEY detected: ${groqKey ? groqKey.substring(0, 10) + '...' : 'EMPTY'}`);

                    if (groqKey) {
                        console.log(`🤖 AI Orchestrator: Attempting [${method}] with provider [groq]`);
                        return await groqProvider[method](...args);
                    } else {
                        console.warn(`⚠️ Groq provider skipped: GROQ_API_KEY is missing or empty in .env`);
                    }
                }

                if (provider === 'mock_secondary') {
                    console.warn(`⚠️ All real AI providers failed or are unconfigured. Falling back to [mock_secondary]`);
                    return await simulateSecondaryProvider(method, args);
                }
            } catch (error) {
                lastError = error;
                console.error(`❌ Provider [${provider}] failed for [${method}]:`, error.message);
                continue;
            }
        }

        throw new Error(`AI Gateway Error: All providers failed. Last error: ${lastError?.message}`);
    };
});

/**
 * Simulated Secondary Provider
 * This mimics a secondary LLM response (e.g., from Groq or OpenAI).
 */
async function simulateSecondaryProvider(method, args) {
    const isJsonMethod = ['analyzeComplexity', 'optimizeWithDiff', 'rubricReview', 'generateTests', 'translateCode', 'narrateCode', 'detectAI'].includes(method);

    if (isJsonMethod) {
        // Return a valid JSON structure tailored to the method
        const mockData = {
            analyzeComplexity: {
                timeComplexity: "O(n) [Fallback]",
                spaceComplexity: "O(1) [Fallback]",
                explanation: "The primary AI service is busy. This estimate is provided by our backup engine.",
                growthData: { labels: [10, 100], yourCode: [10, 100], reference: { "O(n)": [10, 100] } }
            },
            detectAI: {
                aiProbability: 50,
                verdict: "Mixed/Uncertain [Fallback]",
                analysis: "Backup analysis enabled due to primary service quota limits.",
                telltaleSigns: ["Secondary engine cannot provide granular signs."]
            },
            narrateCode: {
                narration: [{ line: 1, explanation: "Line-by-line narration is limited in fallback mode." }],
                summary: "Backup narration active."
            },
            optimizeWithDiff: {
                optimizedCode: "// Backup Optimization Code",
                changes: [],
                summary: "Simplified optimization provided by fallback engine.",
                complexityBefore: "O(n^2)",
                complexityAfter: "O(n)",
                pattern: "Fallback Logic"
            },
            rubricReview: {
                overallScore: 70,
                categories: {
                    readability: { score: 70, feedback: "Fallback feedback." },
                    efficiency: { score: 70, feedback: "Fallback feedback." },
                    bestPractices: { score: 70, feedback: "Fallback feedback." },
                    errorHandling: { score: 70, feedback: "Fallback feedback." },
                    codeStructure: { score: 70, feedback: "Fallback feedback." }
                },
                summary: "Summary provided by backup engine."
            },
            generateTests: {
                functionName: "unknown",
                testCases: [{ name: "Fallback Test", input: "0", expected: "0", category: "normal" }],
                runnerCode: "// Backup Test Runner"
            }
        };

        return JSON.stringify(mockData[method] || { message: "Backup data provided", status: "success" });
    }

    return `[FALLBACK] Our primary AI is currently at its limit. Here is a simplified response from our backup engine to keep you moving!`;
}

module.exports = aiService;
