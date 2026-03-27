const axios = require('axios');
const { PROMPTS } = require('./aiPrompts');

/**
 * Ollama AI Service Provider
 * Local fallback for maximum reliability.
 */
const generateOllamaResponse = async (prompt, model = 'qwen2.5-coder:14b') => {
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: model,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.2
            }
        });

        let content = response.data.response;

        // Clean up markdown
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0].trim();
        }

        return content;
    } catch (error) {
        console.error('Ollama Local API Error:', error.message);
        throw new Error('Local Ollama instance not reachable. Make sure it is running on port 11434.');
    }
};

const ollamaProvider = {};

// Map methods to PROMPTS
const methodToPrompt = {
    getHint: 'hint',
    explainError: 'explainError',
    suggestOptimizations: 'optimize',
    reviewCode: 'review',
    analyzeComplexity: 'complexity',
    optimizeWithDiff: 'optimizeWithDiff',
    rubricReview: 'rubricReview',
    generateTests: 'generateTests',
    translateCode: 'translateCode',
    narrateCode: 'narrateCode',
    detectAI: 'detectAI',
    ghostHint: 'ghostHint',
    generateInterviewTestCases: 'generateInterviewTestCases',
    generateInterviewProblems: 'generateInterviewProblems',
    socraticTutor: 'socraticTutor'
};

Object.entries(methodToPrompt).forEach(([method, promptKey]) => {
    ollamaProvider[method] = async (...args) => {
        const promptFn = PROMPTS[promptKey];
        if (!promptFn) return "Feedback unavailable.";

        const prompt = promptFn(...args);
        const content = await generateOllamaResponse(prompt);

        // Auto-parse JSON
        const jsonMethods = [
            'analyzeComplexity', 'optimizeWithDiff', 'rubricReview', 
            'generateTests', 'translateCode', 'narrateCode', 'detectAI',
            'socraticTutor', 'analyzeIntuition', 'generateInterviewTestCases',
            'generateInterviewProblems'
        ];

        if (jsonMethods.includes(method)) {
            try {
                return JSON.parse(content);
            } catch (e) {
                try {
                    const cleaned = content.replace(/```json|```/g, '').trim();
                    return JSON.parse(cleaned);
                } catch (e2) {
                    throw new Error(`Invalid JSON from Ollama for ${method}`);
                }
            }
        }

        return content;
    };
});

module.exports = ollamaProvider;
