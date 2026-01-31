import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * QuizCreator - Page for instructors to create custom quizzes
 */

const QuizCreator = () => {
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState({
        title: '',
        description: '',
        difficulty: 'beginner',
        category: 'general',
        questions: []
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correct: 0,
        explanation: ''
    });
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleQuizChange = (field, value) => {
        setQuiz(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (field, value) => {
        setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index, value) => {
        setCurrentQuestion(prev => {
            const newOptions = [...prev.options];
            newOptions[index] = value;
            return { ...prev, options: newOptions };
        });
    };

    const addQuestion = () => {
        if (!currentQuestion.question.trim()) {
            setError('Question text is required');
            return;
        }
        if (currentQuestion.options.some(opt => !opt.trim())) {
            setError('All options must be filled');
            return;
        }

        setQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, currentQuestion]
        }));
        setCurrentQuestion({
            question: '',
            options: ['', '', '', ''],
            correct: 0,
            explanation: ''
        });
        setError('');
    };

    const removeQuestion = (index) => {
        setQuiz(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const saveQuiz = async (publish = false) => {
        if (!quiz.title.trim()) {
            setError('Quiz title is required');
            return;
        }
        if (quiz.questions.length < 1) {
            setError('Add at least one question');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const userInfo = localStorage.getItem('userInfo');
            const token = userInfo ? JSON.parse(userInfo).token : null;
            if (!token) {
                setError('You must be logged in to create quizzes');
                setSaving(false);
                return;
            }

            const res = await fetch('http://localhost:5001/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...quiz,
                    isPublished: publish
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to save quiz');
            }

            const savedQuiz = await res.json();
            alert(publish ? 'Quiz published!' : 'Quiz saved as draft!');
            navigate('/learn');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/learn')} style={styles.backBtn}>
                    ← Back to Learning
                </button>
                <h2 style={styles.title}>📝 Create Quiz</h2>
                <div style={styles.actions}>
                    <button
                        onClick={() => saveQuiz(false)}
                        style={styles.draftBtn}
                        disabled={saving}
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => saveQuiz(true)}
                        style={styles.publishBtn}
                        disabled={saving}
                    >
                        Publish
                    </button>
                </div>
            </header>

            {error && (
                <div style={styles.error}>{error}</div>
            )}

            <div style={styles.content}>
                {/* Quiz Details */}
                <section style={styles.section}>
                    <h3 style={styles.sectionTitle}>Quiz Details</h3>
                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Title *</label>
                            <input
                                type="text"
                                value={quiz.title}
                                onChange={(e) => handleQuizChange('title', e.target.value)}
                                style={styles.input}
                                placeholder="e.g., JavaScript Basics Quiz"
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Category</label>
                            <select
                                value={quiz.category}
                                onChange={(e) => handleQuizChange('category', e.target.value)}
                                style={styles.select}
                            >
                                <option value="general">General</option>
                                <option value="basics">Basics</option>
                                <option value="arrays">Arrays</option>
                                <option value="sorting">Sorting</option>
                                <option value="searching">Searching</option>
                                <option value="data-structures">Data Structures</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Difficulty</label>
                            <select
                                value={quiz.difficulty}
                                onChange={(e) => handleQuizChange('difficulty', e.target.value)}
                                style={styles.select}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={quiz.description}
                            onChange={(e) => handleQuizChange('description', e.target.value)}
                            style={styles.textarea}
                            placeholder="Brief description of what this quiz covers..."
                            rows={2}
                        />
                    </div>
                </section>

                {/* Add Question */}
                <section style={styles.section}>
                    <h3 style={styles.sectionTitle}>Add Question</h3>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Question *</label>
                        <input
                            type="text"
                            value={currentQuestion.question}
                            onChange={(e) => handleQuestionChange('question', e.target.value)}
                            style={styles.input}
                            placeholder="Enter your question..."
                        />
                    </div>
                    <div style={styles.optionsGrid}>
                        {currentQuestion.options.map((option, i) => (
                            <div key={i} style={styles.optionGroup}>
                                <label style={styles.optionLabel}>
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={currentQuestion.correct === i}
                                        onChange={() => handleQuestionChange('correct', i)}
                                    />
                                    Option {i + 1} {currentQuestion.correct === i && '✓'}
                                </label>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    style={styles.optionInput}
                                    placeholder={`Option ${i + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Explanation (shown after answer)</label>
                        <input
                            type="text"
                            value={currentQuestion.explanation}
                            onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                            style={styles.input}
                            placeholder="Why is this the correct answer?"
                        />
                    </div>
                    <button onClick={addQuestion} style={styles.addBtn}>
                        + Add Question
                    </button>
                </section>

                {/* Questions List */}
                {quiz.questions.length > 0 && (
                    <section style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            Questions ({quiz.questions.length})
                        </h3>
                        <div style={styles.questionsList}>
                            {quiz.questions.map((q, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={styles.questionItem}
                                >
                                    <div style={styles.questionNum}>Q{index + 1}</div>
                                    <div style={styles.questionText}>{q.question}</div>
                                    <button
                                        onClick={() => removeQuestion(index)}
                                        style={styles.removeBtn}
                                    >
                                        ✕
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        padding: '20px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    title: {
        margin: 0,
        fontSize: '24px'
    },
    actions: {
        display: 'flex',
        gap: '10px'
    },
    draftBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.3)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    publishBtn: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        color: '#fff',
        padding: '8px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    error: {
        background: 'rgba(255, 100, 100, 0.2)',
        border: '1px solid rgba(255, 100, 100, 0.5)',
        color: '#ff6b6b',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    section: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
    },
    sectionTitle: {
        margin: '0 0 15px 0',
        fontSize: '16px',
        color: '#ddd'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '12px',
        color: '#888',
        textTransform: 'uppercase'
    },
    input: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px 12px',
        color: '#fff',
        fontSize: '14px'
    },
    select: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px 12px',
        color: '#fff',
        fontSize: '14px'
    },
    textarea: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px 12px',
        color: '#fff',
        fontSize: '14px',
        resize: 'vertical'
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '15px'
    },
    optionGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    optionLabel: {
        fontSize: '12px',
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    optionInput: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '8px 10px',
        color: '#fff',
        fontSize: '14px'
    },
    addBtn: {
        background: 'rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.4)',
        color: '#667eea',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        width: '100%',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    questionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    questionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px'
    },
    questionNum: {
        background: 'rgba(102, 126, 234, 0.3)',
        padding: '5px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    questionText: {
        flex: 1,
        fontSize: '14px'
    },
    removeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '5px'
    }
};

export default QuizCreator;
