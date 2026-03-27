/**
 * PyTorch & Deep Learning - Learning Path
 * Building and training neural networks using the industry-standard framework.
 */

export const PYTORCH_PATH = {
    id: 'pytorch-basics',
    title: 'PyTorch & Deep Learning',
    icon: '🔥',
    category: 'Artificial Intelligence',
    description: 'Learn the "Research King" framework: tensors, autograd, and building custom neural architectures.',
    prerequisites: ['ml-models'],
    lessons: [
        {
            id: 'pytorch-tensors',
            title: 'Tensors: The Engine of AI',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Tensors are the fundamental data structures in PyTorch. They are multidimensional arrays that can run on a GPU for high-speed computation.'
                },
                {
                    type: 'tip',
                    content: 'Always check your device! You can move tensors between CPU and GPU using \`.to("cuda")\` or \`.to("mps")\` (for Mac) to unlock massive speedups.'
                }
            ],
            keyConcepts: [
                'Tensor Shapes & Ranks',
                'Matrix Multiplication',
                'Broadcasting',
                'GPU Acceleration'
            ],
            code: {
                python: `import torch

# 1. Create a tensor from a list
x = torch.tensor([[1, 2], [3, 4]])

# 2. Matrix Multiplication
y = torch.tensor([[5, 6], [7, 8]])
z = torch.matmul(x, y)

# 3. Check for GPU (CUDA)
if torch.cuda.is_available():
    x = x.to("cuda")
    print("Moved to GPU!")

print(f"Result:\\n{z}")`
            },
            quiz: [
                {
                    question: 'What is the main advantage of PyTorch Tensors over NumPy arrays?',
                    options: [
                        'They are smaller in memory',
                        'They can run on GPUs and support Autograd',
                        'They only handle integers',
                        'They don\'t require imports'
                    ],
                    correct: 1,
                    explanation: 'PyTorch Tensors are designed for deep learning, offering built-in support for hardware acceleration and automated gradient calculation.'
                }
            ]
        },
        {
            id: 'pytorch-autograd',
            title: 'Autograd: Automatic Differentiation',
            duration: '20 min',
            explanation: [
                {
                    type: 'text',
                    content: 'How do neural networks "learn"? They use a process called Backpropagation. PyTorch\'s **Autograd** engine handles this by tracking every operation performed on a tensor.'
                },
                {
                    type: 'text',
                    content: 'When you call \`.backward()\`, PyTorch automatically calculates the "Gradient" (how much to change each weight) to minimize the error.'
                }
            ],
            keyConcepts: [
                'Computational Graphs',
                'Gradients (df/dx)',
                '.requires_grad=True',
                '.backward()'
            ],
            code: {
                python: `import torch

# Create a tensor and track operations
x = torch.ones(2, 2, requires_grad=True)

# Perform some math: y = (x + 2)^2
y = x + 2
z = y * y * 3
out = z.mean()

# Backpropagation
out.backward()

# View the gradient d(out)/dx
print(f"Gradients:\\n{x.grad}")`
            },
            quiz: [
                {
                    question: 'What does calling .backward() do in PyTorch?',
                    options: [
                         'Resets the model',
                         'Calculates the gradients of the loss w.r.t the weights',
                         'Moves data to the CPU',
                         'Predicts the next value'
                    ],
                    correct: 1,
                    explanation: 'backward() triggers the chain rule to compute gradients throughout the computational graph.'
                }
            ]
        },
        {
            id: 'pytorch-nn-module',
            title: 'Building Models with nn.Module',
            duration: '25 min',
            explanation: [
                {
                    type: 'text',
                    content: 'In PyTorch, everything is a Module. You create a custom class that inherits from \`nn.Module\` to define your neural network architecture.'
                },
                {
                    type: 'text',
                    content: 'You define the layers in the \`init\` method and describe how data flows through them in the \`forward\` method.'
                }
            ],
            keyConcepts: [
                'nn.Linear (Fully Connected)',
                'forward() implementation',
                'Activation Layers (ReLU)',
                'Model Parameters'
            ],
            code: {
                python: `import torch.nn as nn
import torch.nn.functional as F

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Input layer (10 features) -> Hidden (50)
        self.fc1 = nn.Linear(10, 50)
        # Hidden (50) -> Output (2 classes)
        self.fc2 = nn.Linear(50, 2)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

model = SimpleNet()
print(model)`
            },
            quiz: [
                {
                    question: 'Where do you define the data flow in a PyTorch model?',
                    options: ['__init__ method', 'forward method', 'fit method', 'predict method'],
                    correct: 1,
                    explanation: 'The forward method is where you implement the actual sequence of operations performed on input data.'
                }
            ]
        }
    ]
};
