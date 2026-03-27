/**
 * Reinforcement Learning - Learning Path
 * Teaching agents to learn through trial and error in standard environments.
 */

export const RL_PATH = {
    id: 'reinforcement-learning',
    title: 'Reinforcement Learning',
    icon: '🕹️',
    category: 'Artificial Intelligence',
    description: 'Master the loop of Observation, Reward, and Action using the Gymnasium (OpenAI Gym) API.',
    prerequisites: ['ml-models', 'pytorch-basics'],
    lessons: [
        {
            id: 'rl-concepts',
            title: 'The Agent-Environment Loop',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Reinforcement Learning (RL) is a paradigm of ML where an agent learns to behave in an environment by performing actions and seeing the results.'
                },
                {
                    type: 'text',
                    content: 'The "State" is what the agent sees, the "Action" is what it does, and the "Reward" is the feedback it gets (positive or negative).'
                }
            ],
            keyConcepts: [
                'Agent vs Environment',
                'State Space & Action Space',
                'Reward Function',
                'Exploration vs Exploitation'
            ],
            code: {
                python: `import gymnasium as gym

# Create the standard CartPole environment
env = gym.make("CartPole-v1")

# Reset to get the initial observation
obs, info = env.reset()

for _ in range(10):
    # Take a random action
    action = env.action_space.sample()
    
    # Step into the environment
    obs, reward, terminated, truncated, info = env.step(action)
    
    if terminated or truncated:
        obs, info = env.reset()

env.close()`
            },
            quiz: [
                {
                    question: 'What is the role of the Environment in RL?',
                    options: [
                        'To learn from the agent',
                        'To provide states and rewards based on actions',
                        'To store the neural network weights',
                        'To predict future actions'
                    ],
                    correct: 1,
                    explanation: 'The environment reacts to actions by changing state and issuing a scalar reward signal.'
                }
            ]
        },
        {
            id: 'q-learning',
            title: 'Q-Learning & Tabular Methods',
            duration: '20 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Q-Learning is a foundational RL algorithm. It seeks to find the best action to take given the current state. It stores these "Quality" values in a Q-Table.'
                },
                {
                    type: 'text',
                    content: 'The **Bellman Equation** is used to update these Q-values based on the reward received and the maximum potential reward of the next state.'
                }
            ],
            keyConcepts: [
                'Q-Table',
                'Bellman Equation',
                'Learning Rate (Alpha)',
                'Discount Factor (Gamma)'
            ],
            code: {
                python: `import numpy as np

# Simple Q-Table (4 states, 2 actions)
q_table = np.zeros([4, 2])

# Update logic (Simplified)
# Q(s,a) = Q(s,a) + alpha * [reward + gamma * max(Q(s',a')) - Q(s,a)]

reward = 10
alpha = 0.1
gamma = 0.9

current_q = q_table[0, 0]
max_future_q = 5

new_q = current_q + alpha * (reward + gamma * max_future_q - current_q)
q_table[0, 0] = new_q

print(f"Updated Q-value: {q_table[0, 0]}")`
            },
            quiz: [
                {
                    question: 'What does the "Gamma" (Discount Factor) represent?',
                    options: [
                        'The learning speed',
                        'How much we value future rewards over immediate ones',
                        'The probability of a random action',
                        'The depth of the neural network'
                    ],
                    correct: 1,
                    explanation: 'Gamma determines the importance of long-term vs short-term rewards. Higher gamma means the agent is more "forward-thinking."'
                }
            ]
        }
    ]
};
