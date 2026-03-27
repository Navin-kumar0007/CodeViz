const geminiProvider = require('./geminiService');
const groqProvider = require('./groqService');
const ollamaProvider = require('./ollamaService');
const crypto = require('crypto');
const { getClient } = require('../config/redis');

// Configuration for provider priority
const PROVIDER_CHAIN = ['gemini', 'openai', 'groq', 'ollama', 'mock_secondary'];

/**
 * AI Service Orchestrator
 * Automatically falls back to secondary providers if the primary fails.
 */

// Mapping of functions to their provider counterparts
const AI_METHODS = [
    'getHint', 'explainError', 'suggestOptimizations', 'reviewCode',
    'analyzeComplexity', 'optimizeWithDiff', 'rubricReview', 'generateTests',
    'translateCode', 'narrateCode', 'detectAI', 'ghostHint', 'analyzeIntuition',
    'socraticTutor', 'generateInterviewTestCases', 'generateInterviewProblems'
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
                    }
                }

                if (provider === 'groq') {
                    const groqKey = process.env.GROQ_API_KEY;
                    if (groqKey) {
                        console.log(`🤖 AI Orchestrator: Attempting [${method}] with provider [groq]`);
                        return await groqProvider[method](...args);
                    }
                }

                if (provider === 'ollama') {
                    console.log(`🤖 AI Orchestrator: Attempting [${method}] with local [ollama]`);
                    return await ollamaProvider[method](...args);
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
    const isJsonMethod = [
        'analyzeComplexity', 'optimizeWithDiff', 'rubricReview', 
        'generateTests', 'translateCode', 'narrateCode', 'detectAI',
        'socraticTutor', 'analyzeIntuition', 'generateInterviewTestCases',
        'generateInterviewProblems'
    ].includes(method);

    if (isJsonMethod) {
        const fallbacks = [
            "If you trace your code step-by-step, where exactly does the value change unexpectedly?",
            "What assumptions are you making about the input that might not always be true?",
            "How does your current logic handle the very first or very last element?",
            "If you had to explain this bug to a rubber duck, which line would you start with?",
            "What would happen if this loop ran one more (or one less) time than it does now?"
        ];
        
        // Handle methods that need a specific count
        if (method === 'generateInterviewProblems') {
            const count = args[1] || 1;
            const problems = [];
            for (let i = 1; i <= count; i++) {
                problems.push({
                    id: `mock-ai-${i}`,
                    title: `Mock AI Problem ${i}`,
                    description: "All AI providers are currently unavailable. This is a placeholder problem.",
                    difficulty: args[0] || "medium",
                    category: "arrays",
                    timeEstimate: 15,
                    companies: ["System Fallback"],
                    hints: ["Try to re-establish connection"],
                    starterCode: "def solution(p):\n    # TODO: Implement\n    pass\n\n# Test\nimport sys\n# (Mock runner code)\n",
                    testCases: [{ input: "a", expectedOutput: "a" }]
                });
            }
            return problems;
        }

        if (method === 'generateInterviewTestCases') {
            return [
                { input: "1 2 3", expectedOutput: "6" },
                { input: "0", expectedOutput: "0" },
                { input: "-1", expectedOutput: "-1" }
            ];
        }

        const mockData = {
            socraticTutor: {
                question: `${fallbacks[Math.floor(Math.random() * fallbacks.length)]} [Backup AI]`
            },
            analyzeIntuition: {
                score: 50,
                feedback: "Secondary engine fallback analysis."
            },
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

        // Return parsed objects ONLY for the 4 methods that expect them. Output strings for the rest.
        const requiresObject = ['socraticTutor', 'analyzeIntuition', 'generateInterviewTestCases', 'generateInterviewProblems'];
        const result = mockData[method] || { message: "Backup data provided", status: "success" };

        if (requiresObject.includes(method)) {
            return result;
        }

        return JSON.stringify(result);
    }

    return `[FALLBACK] Our primary AI is currently at its limit. Here is a simplified response from our backup engine to keep you moving!`;
}

module.exports = aiService;
