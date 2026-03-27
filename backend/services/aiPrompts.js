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

Return ONLY the JSON:`,

    narrateCode: (code, language, skillLevel = 'beginner', teachingStyle = 'standard') => `
You are an AI Code Narrator. Explain this code line-by-line or block-by-block.
Return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "narration": [
    { "line": 1, "explanation": "Brief explanation of what line 1 does" },
    { "block": "lines 2-5", "explanation": "Explanation of this block of code" }
  ],
  "summary": "Overall summary of the algorithm/code"
}
${getTeachingContext(skillLevel, teachingStyle)}

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON:`,

    detectAI: (code, language) => `
You are an expert code forensics analyst. Analyze this code and determine the probability that it was generated by an AI (like ChatGPT, Claude, Gemini) versus being written by a human student.
Return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "aiProbability": <number 0-100 representing percentage likelihood of AI generation>,
  "verdict": "Likely AI" | "Likely Human" | "Mixed/Uncertain",
  "analysis": "A detailed 2-3 sentence explanation of your reasoning.",
  "telltaleSigns": [
    "Specific signs you noticed, e.g., 'Overly perfect variable naming', 'Lack of human-like comments', 'Complex idiomatic structures an average student wouldn't use'"
  ]
}

Look for AI signatures:
- Perfect, textbook-style comments
- Unusually advanced idiomatic patterns for a simple problem
- Zero dead code, perfectly structured edge-case handling
- Over-explaining trivial logic

Look for Human signatures:
- Quirky or inconsistent variable naming (e.g., 'tempVar', 'x1', 'myCounter')
- Commented out debugging statements (e.g., 'console.log("here")', 'print("test")')
- Slightly inefficient loop structures or redundant logic
- Typos in variable names or comments

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON:`,

    ghostHint: (code, language, errors, timeSpent, skillLevel = 'beginner', teachingStyle = 'standard') => `
You are the "Ghost Assistant" for CodeViz. You noticed the student might be stuck.
They have spent ${timeSpent} seconds on this part of the code.
Recent Errors: ${errors || 'None detected yet'}

${getTeachingContext(skillLevel, teachingStyle)}

Current Code:
\`\`\`${language}
${code}
\`\`\`

Instead of waiting for them to ask, give a very subtle, encouraging "nudge" or observation. 
Don't give the answer. Just point out one thing they might want to look at, or offer a tiny bit of encouragement.
Keep it to 2 sentences max. Use 👻.

Nudge:`,

    socraticTutor: (code, language, error, executionState, skillLevel = 'beginner', teachingStyle = 'standard', isRetry = false, requestCount = 0) => `
You are a Socratic Tutor for a student learning coding in CodeViz.
The student is stuck. 
${getTeachingContext(skillLevel, teachingStyle)}

Current Code:
\`\`\`${language}
${code}
\`\`\`

Current Error/Execution Result:
${error}

Execution State (Trace/Variables):
${JSON.stringify(executionState)}

${isRetry ? `NOTE: This is retry #${requestCount}. The student found the previous question(s) unhelpful. TRY A COMPLETELY DIFFERENT ANGLE. (e.g., if you asked about a loop, now ask about a specific variable value, or an edge case like 0 or null).` : ''}

YOUR GOAL: Do NOT provide the corrected code. Do NOT give the direct answer.
INSTEAD: Ask ONE short, punchy question that leads the student to realize their mistake.
Focus on logic, indices, or data structure behavior.

STRICT VARIETY: Every response must be structurally different from a typical generic hint. Use the current execution state to be highly specific.
Return ONLY a valid JSON object with no markdown formatting, no code fences:
{
  "question": "Your Socratic question here",
  "lineNumber": <optional line number where the bug is likely located, else null>
}
`,

    generateInterviewTestCases: (problemDescription) => `
You are an expert technical interviewer. I will provide you with a problem description.
You must generate 5 rigorous, extreme test cases to validate a candidate's code. Include edge cases.

Problem Description:
${problemDescription}

You MUST return ONLY a valid JSON array of objects. No markdown formatting, no backticks, no text. Just the array.
Format exactly like this:
[
  { "input": "input_string_here\\nanother_input", "expectedOutput": "output_string_here" },
  ...
]
`,

    generateInterviewProblems: (mode, problemCount) => `
You are an expert technical interviewer at a FAANG company. 
I need you to invent ${problemCount} BRAND NEW, completely unique Data Structures and Algorithms (DSA) problems.
DO NOT use standard LeetCode questions verbatim (e.g., no "Two Sum", no "Merge K Lists"). Create unique scenarios.

Difficulty Mode Requested: ${mode} (If 'mixed', provide a variety of difficulties).

You MUST return ONLY a valid JSON array of objects. No markdown formatting, no text. Just the array.
Format exactly like this:
[
  {
    "id": "ai-gen-1",
    "title": "A short engaging title",
    "description": "Full problem description with constraints. Clearly define the input format.",
    "difficulty": "easy|medium|hard",
    "category": "arrays|strings|linked_lists|trees|graphs|dp",
    "timeEstimate": 15,
    "companies": ["AI Generated"],
    "hints": ["Hint 1", "Hint 2"],
    "starterCode": "def solution(params):\n    # TODO: Implement your solution here\n    pass\n\n# Test\n# CRITICAL: You MUST include the input parsing logic here.\n# It should read from sys.stdin and call solution().\n# Example:\n# import sys\n# lines = sys.stdin.readlines()\n# ... call solution ...\n# print(result)",
    "testCases": [
      { "input": "...", "expectedOutput": "..." }
    ]
  }
]

CRITICAL RULES:
1. **NO SOLUTIONS**: The \`starterCode\` must NOT contain any logic for the problem. Use \`pass\` (Python) or \`return null\` (JS).
2. **STRICT INPUT PARSING**: The \`# Test\` block is REQUIRED. It MUST correctly parse the \`input\` string provided in \`testCases\` and output exactly the \`expectedOutput\`.
3. **UNIQUE SCENARIOS**: Create interesting backstories (space travel, robot navigation, etc.) but with solid DSA foundations.
`
};

module.exports = {
    SKILL_CONTEXT,
    TEACHING_STYLE,
    getTeachingContext,
    PROMPTS
};
