/**
 * Machine Learning Essentials - Learning Path
 * Foundations of statistical learning beyond neural networks.
 */

export const ML_MODELS_PATH = {
    id: 'ml-models',
    title: 'Machine Learning Essentials',
    icon: '📊',
    category: 'Artificial Intelligence',
    description: 'Master the statistical models that power modern data science: Linear, Bayesian, and Tree-based models.',
    prerequisites: ['basics'],
    lessons: [
        {
            id: 'linear-regression',
            title: 'Linear Regression: Predicting Values',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Linear Regression is the simplest form of predictive modeling. It assumes a linear relationship between the input variables (X) and the single output variable (Y).'
                },
                {
                    type: 'text',
                    content: 'The goal is to find the line of "best fit" that minimizes the sum of squared differences between predicted and actual values (Mean Squared Error).'
                }
            ],
            keyConcepts: [
                'Line of Best Fit (y = mx + b)',
                'Features and Targets',
                'Mean Squared Error (MSE)',
                'Correlation vs Causation'
            ],
            code: {
                python: `from sklearn.linear_model import LinearRegression
import numpy as np

# Height (cm) to Weight (kg)
X = np.array([[150], [160], [170], [180]])
y = np.array([50, 60, 70, 80])

model = LinearRegression()
model.fit(X, y)

prediction = model.predict([[175]])
print(f"Predicted weight for 175cm: {prediction[0]}kg")`,
                javascript: `// Conceptual implementation using simple math
const predict = (x, slope, intercept) => x * slope + intercept;

const slope = 1.0; e
const intercept = -100;

console.log(\`Predicted weight for 175cm: \${predict(175, slope, intercept)}kg\`);`
            },
            quiz: [
                {
                    question: 'What does Linear Regression aim to minimize?',
                    options: ['The complexity of the model', 'The number of features', 'The Mean Squared Error (MSE)', 'The training time'],
                    correct: 2,
                    explanation: 'The standard objective of Linear Regression is to minimize the distance between the data points and the regression line.'
                }
            ]
        },
        {
            id: 'naive-bayes',
            title: 'Naive Bayes: Probabilistic Search',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Naive Bayes is a classification algorithm based on Bayes\' Theorem. It is called "Naive" because it assumes that every feature is independent of the others.'
                },
                {
                    type: 'tip',
                    content: 'Naive Bayes is extremely powerful for text classification, such as Spam Detection or Sentiment Analysis, because it handles large feature sets (like words in a dictionary) very efficiently.'
                }
            ],
            keyConcepts: [
                'Bayes Theorem',
                'Prior & Posterior Probability',
                'Independence Assumption',
                'Feature Log-Likelihood'
            ],
            code: {
                python: `from sklearn.naive_bayes import GaussianNB

# Features: [IsSunny, IsWeekend] (Boolean)
X = [[1, 0], [1, 1], [0, 0], [0, 1]]
y = [1, 1, 0, 0] # 1: Play Golf, 0: Stay Home

model = GaussianNB()
model.fit(X, y)

# Predict for Sunny Weekend
print(f"Prediction: {model.predict([[1, 1]])}")`,
                javascript: `// Naive Bayes works on probability multiplication
const p_sunny = 0.5;
const p_golf_given_sunny = 0.8;

const result = p_sunny * p_golf_given_sunny;
console.log(\`Probabilistic approach: \${result}\`);`
            },
            quiz: [
                {
                    question: 'Why is it called "Naive" Bayes?',
                    options: [
                        'Because it is very simple to write',
                        'Because it assumes features are independent',
                        'Because it only works with numbers',
                        'Because it doesn\'t need training data'
                    ],
                    correct: 1,
                    explanation: 'The "naive" part comes from assuming that the occurrence of one feature is unrelated to the occurrence of any other feature.'
                }
            ]
        },
        {
            id: 'decision-trees',
            title: 'Decision Trees & Logic',
            duration: '18 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A Decision Tree handles data by splitting it based on questions. It creates a flowchart-like structure where each node represents a test on an attribute.'
                },
                {
                    type: 'text',
                    content: 'Information Gain and Gini Impurity are metrics used to decide where to "split" the tree to get the most "pure" segments of data.'
                }
            ],
            keyConcepts: [
                'Entropy & Gini Impurity',
                'Root, Internal, and Leaf Nodes',
                'Overfitting & Pruning',
                'Random Forests (Ensembles)'
            ],
            code: {
                python: `from sklearn.tree import DecisionTreeClassifier

# Features: [Temperature > 25, Humidity > 70]
X = [[1, 0], [1, 1], [0, 1], [0, 0]]
y = [1, 0, 0, 1] # 1: Comfortable, 0: Uncomfortable

tree = DecisionTreeClassifier()
tree.fit(X, y)

print(f"Prediction for hot/dry day: {tree.predict([[1, 0]])}")`,
                javascript: `// A Decision Tree is just nested if-else logic at scale
const classify = (temp, humidity) => {
    if (temp > 25) {
        return humidity < 70 ? 'Comfortable' : 'Humid';
    }
    return 'Cool';
};`
            },
            quiz: [
                {
                    question: 'What is a common problem with deep Decision Trees?',
                    options: ['Underfitting', 'Overfitting', 'Slow training', 'High bias'],
                    correct: 1,
                    explanation: 'Deep trees tend to memorize the training data too specifically, leading to poor generalization on new data (overfitting).'
                }
            ]
        }
    ]
};
