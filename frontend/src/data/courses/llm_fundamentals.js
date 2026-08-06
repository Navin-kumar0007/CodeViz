/**
 * LLM Fundamentals - Learning Path
 * How large language models work and how to use them well.
 */

export const LLM_FUNDAMENTALS_PATH = {
    id: 'llm-fundamentals',
    title: 'LLM Fundamentals',
    icon: '🧠',
    category: 'Artificial Intelligence',
    description: 'Understand tokens, prompting, and how to call and control large language models.',
    prerequisites: [],
    lessons: [
        {
            id: 'how-llms-work',
            title: 'How LLMs Work',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A **Large Language Model** predicts the next **token** (a word-piece) given the previous ones. Trained on huge text corpora, it learns patterns of language and reasoning.' },
                { type: 'text', content: 'Text is split into **tokens** — roughly 4 characters each. Models have a **context window** limiting how many tokens they can consider at once.' },
                { type: 'text', content: '**Temperature** controls randomness: low (0–0.3) = focused and deterministic; high (0.8+) = creative and varied.' },
                { type: 'tip', content: 'Both input and output count toward the context window — long prompts leave less room for the answer.' },
            ],
            keyConcepts: [
                'LLMs predict the next token from prior tokens',
                'Text is chunked into tokens (~4 chars each)',
                'The context window caps total tokens',
                'Temperature tunes randomness of output',
            ],
            code: {
                python: `# Calling an LLM (OpenAI-style API)
resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain recursion simply."}],
    temperature=0.2,   # focused, deterministic
    max_tokens=200
)
print(resp.choices[0].message.content)`,
            },
            quiz: [
                {
                    question: 'What does an LLM fundamentally predict?',
                    options: ['The weather', 'The next token given prior tokens', 'A database row', 'A random number'],
                    correct: 1,
                    explanation: 'LLMs are next-token predictors trained on large text corpora.',
                },
                {
                    question: 'What does a low temperature produce?',
                    options: ['More random, creative output', 'More focused, deterministic output', 'Longer output', 'Errors'],
                    correct: 1,
                    explanation: 'Lower temperature makes the model pick high-probability tokens, giving focused, consistent answers.',
                },
            ],
        },
        {
            id: 'prompt-engineering',
            title: 'Prompt Engineering',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A **prompt** is your instruction to the model. Clear, specific prompts with context and desired format produce far better results.' },
                { type: 'text', content: '**System prompts** set the model’s role/behavior. **Few-shot** prompting gives examples of the desired input→output to steer the model.' },
                { type: 'text', content: 'Ask for structured output (e.g. JSON) explicitly, and describe the exact schema you expect.' },
                { type: 'tip', content: '"Chain-of-thought" — asking the model to reason step by step — improves accuracy on complex tasks.' },
            ],
            keyConcepts: [
                'Specific prompts with context beat vague ones',
                'System prompts set role and behavior',
                'Few-shot examples steer the output format',
                'Ask for step-by-step reasoning on hard tasks',
            ],
            code: {
                python: `messages = [
    {"role": "system",
     "content": "You are a strict JSON API. Reply ONLY with JSON."},
    # few-shot example
    {"role": "user", "content": "Extract name and age: 'Ada is 30'"},
    {"role": "assistant", "content": '{"name":"Ada","age":30}'},
    # real request
    {"role": "user", "content": "Extract name and age: 'Linus is 25'"}
]`,
            },
            quiz: [
                {
                    question: 'What is the role of a system prompt?',
                    options: ['To count tokens', 'To set the model’s role and behavior', 'To store data', 'To translate text'],
                    correct: 1,
                    explanation: 'The system prompt establishes how the model should behave for the whole conversation.',
                },
                {
                    question: 'What is few-shot prompting?',
                    options: ['Asking many questions fast', 'Providing example input→output pairs to steer the model', 'Using low temperature', 'Shortening the prompt'],
                    correct: 1,
                    explanation: 'Few-shot prompting includes examples that demonstrate the desired behavior and format.',
                },
            ],
        },
        {
            id: 'rag-basics',
            title: 'Grounding LLMs with RAG',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'LLMs can **hallucinate** — state confident but wrong facts — because they only know their training data. **RAG** (Retrieval-Augmented Generation) fixes this by giving the model relevant documents at query time.' },
                { type: 'text', content: 'RAG flow: **embed** your documents into vectors, store them in a **vector database**, retrieve the most similar chunks for a question, and put them in the prompt as context.' },
                { type: 'tip', content: 'RAG lets a model answer from *your* data (docs, tickets, code) without retraining it.' },
            ],
            keyConcepts: [
                'LLMs hallucinate beyond their training data',
                'RAG injects relevant documents into the prompt',
                'Embeddings turn text into similarity-searchable vectors',
                'A vector DB retrieves the most relevant chunks',
            ],
            code: {
                python: `# Minimal RAG loop
def answer(question, vector_db, llm):
    # 1) retrieve relevant chunks by embedding similarity
    chunks = vector_db.search(question, top_k=4)
    context = "\\n".join(chunks)
    # 2) ground the model with that context
    prompt = f"Context:\\n{context}\\n\\nQuestion: {question}"
    return llm.complete(prompt)`,
            },
            quiz: [
                {
                    question: 'What problem does RAG primarily address?',
                    options: ['Slow networks', 'LLM hallucination / missing knowledge', 'High temperature', 'Token limits only'],
                    correct: 1,
                    explanation: 'RAG grounds the model with retrieved documents, reducing hallucination and adding fresh/private knowledge.',
                },
                {
                    question: 'What does a vector database store for RAG?',
                    options: ['Raw images', 'Embeddings of text for similarity search', 'SQL tables', 'Model weights'],
                    correct: 1,
                    explanation: 'It stores document embeddings so you can retrieve the most semantically similar chunks.',
                },
            ],
        },
    ],
};
