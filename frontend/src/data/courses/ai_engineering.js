/**
 * AI Engineering & Agentic Systems - Learning Path
 * Modern LLM integration, search, and autonomous workflows.
 */

export const AI_ENGINEERING_PATH = {
    id: 'ai-engineering',
    title: 'AI Engineering & Agents',
    icon: '🤖',
    category: 'Artificial Intelligence',
    description: 'Master Large Language Models, Prompt Engineering, RAG systems, and Agentic workflows.',
    prerequisites: ['basics'],
    lessons: [
        {
            id: 'prompt-engineering',
            title: 'Prompt Engineering Masterclass',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Prompt Engineering is the art of crafting inputs that guide LLMs to produce the best possible outputs. It includes techniques like Few-Shot prompting and Chain-of-Thought.'
                },
                {
                    type: 'text',
                    content: '**Chain-of-Thought (CoT)** forces the model to "think step-by-step," which significantly improves performance on reasoning and math tasks.'
                }
            ],
            keyConcepts: [
                'Zero-Shot vs Few-Shot',
                'Chain-of-Thought (CoT)',
                'System vs User Messages',
                'Context Window'
            ],
            code: {
                python: `# Concept: Chain of Thought Prompting
prompt = """
Q: Roger has 5 tennis balls. He buys 2 more cans. Each can has 3 balls. 
   How many balls does he have now?
A: Roger started with 5 balls. 
   2 cans of 3 balls each is 2 * 3 = 6 balls.
   5 + 6 = 11.
   The answer is 11.

Q: The cafeteria had 23 apples. They used 20 to make lunch and bought 6 more.
   How many apples do they have now?
A: """`
            },
            quiz: [
                {
                    question: 'What is Chain-of-Thought (CoT) prompting?',
                    options: [
                        'Shortening the prompt to save tokens',
                        'Asking the model to explain its reasoning step-by-step',
                        'Translating the prompt to multiple languages',
                        'Using a different model for each word'
                    ],
                    correct: 1,
                    explanation: 'CoT encourages the model to generate intermediate reasoning steps before arriving at a final answer.'
                }
            ]
        },
        {
            id: 'rag-systems',
            title: 'RAG: Retrieval Augmented Generation',
            duration: '20 min',
            explanation: [
                {
                    type: 'text',
                    content: 'LLMs are frozen in time (training cutoff). **RAG** allows them to "search" private or new data before answering. This prevents hallucinations and increases accuracy.'
                },
                {
                    type: 'text',
                    content: 'The workflow is: **Vectorize** your data -> **Search** for relevant chunks -> **Inject** those chunks into the prompt.'
                }
            ],
            keyConcepts: [
                'Vector Databases',
                'Cosine Similarity',
                'Hallucination Mitigation',
                'Retrieval Precision'
            ],
            code: {
                python: `import numpy as np

# Concept: Simplest Vector Search
query_vector = [0.1, 0.9]
doc_vectors = {
    "Doc 1": [0.2, 0.85],
    "Doc 2": [0.8, 0.1]
}

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

scores = {name: cosine_sim(query_vector, vec) for name, vec in doc_vectors.items()}
# Result: Doc 1 is a much better match!
print(f"Similarity scores: {scores}")`
            },
            quiz: [
                {
                    question: 'Why do we use RAG instead of just training a new model?',
                    options: [
                        'It is much cheaper and allows for real-time data updates',
                        'It makes the model run faster on mobile devices',
                        'It replaces the need for a GPU',
                        'It only works with small models'
                    ],
                    correct: 0,
                    explanation: 'RAG provides the model with external context without the extreme expense of re-training or fine-tuning.'
                }
            ]
        },
        {
            id: 'agentic-loops',
            title: 'Agentic Loops & Tools',
            duration: '25 min',
            explanation: [
                {
                    type: 'text',
                    content: 'An **AI Agent** is an LLM with the ability to use **Tools** (like a calculator, search engine, or Python interpreter) and run in a **Loop** to solve a complex goal.'
                },
                {
                    type: 'text',
                    content: 'The **ReAct (Reason + Act)** framework is common: the agent thinks about what to do, acts using a tool, observes the result, and loops until the task is done.'
                }
            ],
            keyConcepts: [
                'Tool Calling',
                'Autonomous Loops',
                'Planning & Memory',
                'Multi-Agent orchestration'
            ],
            code: {
                python: `class Agent:
    def __init__(self, tools):
        self.tools = tools

    def run(self, goal):
        print(f"Goal: {goal}")
        # Loop: Think -> Act -> Observe
        thought = "I need to calculate the square root of 256."
        print(f"Thought: {thought}")
        result = self.tools["calculator"].sqrt(256)
        print(f"Action: result = {result}")
        print(f"Final Answer: The result is {result}")`
            },
            quiz: [
                {
                    question: 'What defines an autonomous AI Agent?',
                    options: [
                        'It has a very large memory',
                        'It can autonomously use tools and loop until a goal is met',
                        'It is trained only on code',
                        'It never makes mistakes'
                    ],
                    correct: 1,
                    explanation: 'Agents go beyond simple chatbots by interacting with the digital world through external tools to complete tasks.'
                }
            ]
        }
    ]
};
