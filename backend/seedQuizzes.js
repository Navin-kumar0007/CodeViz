const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CustomQuiz = require('./models/CustomQuiz');
const User = require('./models/User');

dotenv.config();

const quizzes = [
    {
        title: "JavaScript Basics",
        description: "Test your knowledge of fundamental JavaScript concepts.",
        difficulty: "Easy",
        category: "Frontend",
        isPublished: true,
        questions: [
            {
                question: "Which keyword is used to declare a constant variable?",
                options: ["var", "let", "const", "final"],
                correctAnswer: 2
            },
            {
                question: "What is the result of typeof null?",
                options: ["null", "undefined", "object", "number"],
                correctAnswer: 2
            },
            {
                question: "Which method adds an element to the end of an array?",
                options: ["push()", "pop()", "shift()", "unshift()"],
                correctAnswer: 0
            }
        ]
    },
    {
        title: "React Hooks Master",
        description: "Deep dive into useState, useEffect and more.",
        difficulty: "Medium",
        category: "Frontend",
        isPublished: true,
        questions: [
            {
                question: "Which hook is used for side effects?",
                options: ["useState", "useEffect", "useContext", "useReducer"],
                correctAnswer: 1
            },
            {
                question: "What does useRef return?",
                options: ["A function", "A mutable object", "A state value", "HTML element"],
                correctAnswer: 1
            }
        ]
    },
    {
        title: "Node.js Event Loop",
        description: "Advanced concepts of the Node.js runtime.",
        difficulty: "Hard",
        category: "Backend",
        isPublished: true,
        questions: [
            {
                question: "Which phase of the event loop executes setTimeout?",
                options: ["Poll", "Check", "Timers", "Close Callbacks"],
                correctAnswer: 2
            }
        ]
    }
];

const seedDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is missing in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to Cloud...');

        // Clear existing quizzes
        await CustomQuiz.deleteMany({});
        console.log('Cleared existing quizzes...');

        // Get a user to assign as creator
        const user = await User.findOne();
        const userId = user ? user._id : new mongoose.Types.ObjectId();

        const sampleQuizzes = quizzes.map(q => ({ ...q, createdBy: userId }));

        await CustomQuiz.insertMany(sampleQuizzes);
        console.log('✅ Quizzes Seeded Successfully!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
