const axios = require('axios');
const { PROMPTS } = require('./aiPrompts');

/**
 * Groq AI Service Provider
 * High-speed fallback for Gemini quotas.
 */
const generateGroqResponse = async (prompt, model = 'llama-3.3-70b-versatile') => {
    if (!process.env.GROQ_API_KEY) return null;

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2 // Lower temperature for structured JSON consistency
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        let content = response.data.choices[0].message.content;

        // Clean up any potential markdown code fences if the model ignores "ONLY JSON" instruction
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0].trim();
        }

        return content;
    } catch (error) {
        console.error('Groq API Error:', error.response?.data?.error?.message || error.message);
        throw error;
    }
};

const groqProvider = {};

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
    ghostHint: 'ghostHint'
};

Object.entries(methodToPrompt).forEach(([method, promptKey]) => {
    groqProvider[method] = async (...args) => {
        const promptFn = PROMPTS[promptKey];
        if (!promptFn) {
            console.warn(`No prompt template for method ${method}`);
            return "Feedback unavailable.";
        }

        const prompt = promptFn(...args);
        return await generateGroqResponse(prompt);
    };
});

module.exports = groqProvider;
