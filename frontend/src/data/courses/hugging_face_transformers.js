/**
 * Hugging Face & Transformers - Learning Path
 * Utilizing the open-source hub for Natural Language Processing and beyond.
 */

export const HUGGINGFACE_PATH = {
    id: 'huggingface-transformers',
    title: 'Hugging Face & Transformers',
    icon: '🤗',
    category: 'Artificial Intelligence',
    description: 'Master the "GitHub of AI": Use the Transformers library to load state-of-the-art models in seconds.',
    prerequisites: ['pytorch-basics'],
    lessons: [
        {
            id: 'hf-intro',
            title: 'The Hugging Face Ecosystem',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Hugging Face is the central platform for open AI. It consists of the **Hub** (where models are shared), the **Transformers library** (which runs them), and **Datasets**.'
                },
                {
                    type: 'text',
                    content: 'It allows developers to use massive models like BERT, GPT-2, or Llama without needing millions of dollars to train them from scratch.'
                }
            ],
            keyConcepts: [
                'Model Hub',
                'Open Source AI',
                'Inference Endpoints',
                'Model Weights vs Architecture'
            ],
            code: {
                python: `# No installation needed for this demo
from transformers import pipeline

# Sentiment Analysis in 1 line
classifier = pipeline("sentiment-analysis")
result = classifier("I love building educational apps with CodeViz!")[0]

print(f"Label: {result['label']}, Score: {result['score']:.4f}")`
            },
            quiz: [
                {
                    question: 'What is the "Transformers" library mainly used for?',
                    options: [
                        'Changing images into text',
                        'Providing an easy API to load and use pre-trained AI models',
                        'Converting Python code to JavaScript',
                        'Managing database connections'
                    ],
                    correct: 1,
                    explanation: 'Transformers provides a standardized interface for using state-of-the-art weights from the Hugging Face hub.'
                }
            ]
        },
        {
            id: 'tokenization',
            title: 'Tokenizers: How Models Read',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Computers don\'t understand words; they understand numbers. **Tokenization** is the process of breaking text into smaller units (tokens) and mapping them to numeric IDs.'
                },
                {
                    type: 'tip',
                    content: 'Modern models use "Subword Tokenizers" (like BPE or WordPiece) which can handle new words by breaking them into familiar parts (e.g., "unbreakable" -> "un" + "breakable").'
                }
            ],
            keyConcepts: [
                'Vocabulary Index',
                'Attention Mask',
                'Padding & Truncation',
                'Input IDs'
            ],
            code: {
                python: `from transformers import AutoTokenizer

# Load tokenizer for a specific model
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

text = "CodeViz makes learning easy!"
encoded_input = tokenizer(text)

print(f"Tokens IDs: {encoded_input['input_ids']}")
# [101, 3614, 21971, ... 102]`
            },
            quiz: [
                {
                    question: 'What happens during Tokenization?',
                    options: [
                        'The model updates its weights',
                        'Text is converted into a list of numbers (IDs)',
                        'The GPU memory is cleared',
                        'Images are generated from text'
                    ],
                    correct: 1,
                    explanation: 'Tokenization maps characters/words to integers from a pre-defined vocabulary that the model understands.'
                }
            ]
        }
    ]
};
