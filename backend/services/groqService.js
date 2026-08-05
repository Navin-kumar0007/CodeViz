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
    ghostHint: 'ghostHint',
    generateInterviewTestCases: 'generateInterviewTestCases',
    generateInterviewProblems: 'generateInterviewProblems'
};

Object.entries(methodToPrompt).forEach(([method, promptKey]) => {
    groqProvider[method] = async (...args) => {
        const promptFn = PROMPTS[promptKey];
        if (!promptFn) {
            console.warn(`No prompt template for method ${method}`);
            return "Feedback unavailable.";
        }

        const prompt = promptFn(...args);
        const content = await generateGroqResponse(prompt);

        // Auto-parse JSON only for methods where geminiService.js also auto-parses them.
        // Other methods expect strings to be returned so the controller/worker can parse them.
        const jsonMethods = [
            'socraticTutor', 'analyzeIntuition', 'generateInterviewTestCases',
            'generateInterviewProblems'
        ];

        if (jsonMethods.includes(method)) {
            try {
                return JSON.parse(content);
            } catch (e) {
                try {
                    return safeParseJson(content);
                } catch (e2) {
                    console.error(`Failed to parse Groq JSON for ${method}:`, e2.message);
                    throw new Error(`Invalid JSON from Groq for ${method}`);
                }
            }
        }

        return content;
    };
});

/**
 * Robust JSON recovery for LLM output: strip markdown fences, isolate the JSON
 * body, and escape raw control characters that appear INSIDE string literals
 * (LLMs frequently emit unescaped newlines/tabs in code strings, which is the
 * usual "Bad control character in string literal" failure).
 */
function safeParseJson(raw) {
    let text = String(raw).replace(/```json|```/g, '').trim();
    const start = text.search(/[[{]/);
    const end = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
    if (start !== -1 && end !== -1 && end > start) text = text.slice(start, end + 1);

    let out = '';
    let inString = false;
    let escaped = false;
    for (const ch of text) {
        if (escaped) { out += ch; escaped = false; continue; }
        if (ch === '\\') { out += ch; escaped = true; continue; }
        if (ch === '"') { inString = !inString; out += ch; continue; }
        if (inString) {
            const code = ch.charCodeAt(0);
            if (code < 0x20) {
                out += ch === '\n' ? '\\n' : ch === '\t' ? '\\t' : ch === '\r' ? '\\r'
                    : '\\u' + code.toString(16).padStart(4, '0');
                continue;
            }
        }
        out += ch;
    }
    return JSON.parse(out);
}

module.exports = groqProvider;
module.exports.safeParseJson = safeParseJson; // exported for tests
