import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/**
 * QuizBrowser - Browse and take community-created quizzes
 */

const QuizBrowser = ({ onClose }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', difficulty: '' });
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizState, setQuizState] = useState(null); // { currentQ, answers, showResults }

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (filter.category) params.append('category', filter.category);
                if (filter.difficulty) params.append('difficulty', filter.difficulty);

                const res = await fetch(`http://localhost:5001/api/quizzes?${params}`);
                const data = await res.json();
                setQuizzes(data);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [filter]);

    const startQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setQuizState({
            currentQ: 0,
            answers: [],
            showResults: false
        });
    };

    const answerQuestion = (answerIndex) => {
        const newAnswers = [...quizState.answers, answerIndex];
        const isLast = quizState.currentQ >= selectedQuiz.questions.length - 1;

        setQuizState({
            ...quizState,
            answers: newAnswers,
            currentQ: isLast ? quizState.currentQ : quizState.currentQ + 1,
            showResults: isLast
        });

        if (isLast) {
            // Record completion
            recordCompletion(newAnswers);
        }
    };

    const recordCompletion = async (answers) => {
        const correct = answers.filter((ans, i) =>
            ans === selectedQuiz.questions[i].correct
        ).length;
        const score = Math.round((correct / selectedQuiz.questions.length) * 100);

        try {
            await fetch(`http://localhost:5001/api/quizzes/${selectedQuiz._id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score })
            });
        } catch (error) {
            console.error('Error recording completion:', error);
        }
    };

    const getScore = () => {
        if (!quizState || !selectedQuiz) return 0;
        const correct = quizState.answers.filter((ans, i) =>
            ans === selectedQuiz.questions[i].correct
        ).length;
        return Math.round((correct / selectedQuiz.questions.length) * 100);
    };

    const closeQuiz = () => {
        setSelectedQuiz(null);
        setQuizState(null);
    };

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'beginner': return '#4ade80';
            case 'intermediate': return '#fbbf24';
            case 'advanced': return '#f87171';
            default: return '#888';
        }
    };

    // Quiz Taking View
    if (selectedQuiz && quizState) {
        const question = selectedQuiz.questions[quizState.currentQ];

        if (quizState.showResults) {
            return (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={styles.overlay}
                    onClick={closeQuiz}
                >
                    <Motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={styles.panel}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={styles.resultsContainer}>
                            <div style={styles.scoreCircle}>
                                <span style={styles.scoreValue}>{getScore()}%</span>
                            </div>
                            <h2 style={styles.resultsTitle}>
                                {getScore() >= 80 ? '🎉 Excellent!' : getScore() >= 60 ? '👍 Good Job!' : '📚 Keep Learning!'}
                            </h2>
                            <p style={styles.resultsSubtitle}>
                                You got {quizState.answers.filter((ans, i) => ans === selectedQuiz.questions[i].correct).length} out of {selectedQuiz.questions.length} correct
                            </p>
                            <button onClick={closeQuiz} style={styles.closeResultsBtn}>
                                Back to Quizzes
                            </button>
                        </div>
                    </Motion.div>
                </Motion.div>
            );
        }

        return (
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.overlay}
            >
                <Motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={styles.quizPanel}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={styles.quizHeader}>
                        <span style={styles.quizProgress}>
                            Question {quizState.currentQ + 1} of {selectedQuiz.questions.length}
                        </span>
                        <button onClick={closeQuiz} style={styles.closeBtn}>✕</button>
                    </div>
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${((quizState.currentQ + 1) / selectedQuiz.questions.length) * 100}%`
                            }}
                        />
                    </div>
                    <h3 style={styles.questionText}>{question.question}</h3>
                    <div style={styles.optionsList}>
                        {question.options.map((option, i) => (
                            <Motion.button
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => answerQuestion(i)}
                                style={styles.optionBtn}
                            >
                                {option}
                            </Motion.button>
                        ))}
                    </div>
                </Motion.div>
            </Motion.div>
        );
    }

    // Quiz Browser View
    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={onClose}
        >
            <Motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={styles.panel}
                onClick={e => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <h2 style={styles.title}>📚 Community Quizzes</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Filters */}
                <div style={styles.filters}>
                    <select
                        value={filter.category}
                        onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
                        style={styles.filterSelect}
                    >
                        <option value="">All Categories</option>
                        <option value="general">General</option>
                        <option value="basics">Basics</option>
                        <option value="arrays">Arrays</option>
                        <option value="sorting">Sorting</option>
                        <option value="searching">Searching</option>
                        <option value="data-structures">Data Structures</option>
                    </select>
                    <select
                        value={filter.difficulty}
                        onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}
                        style={styles.filterSelect}
                    >
                        <option value="">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                {/* Quiz List */}
                <div style={styles.list}>
                    {loading ? (
                        <div style={styles.loading}>Loading quizzes...</div>
                    ) : quizzes.length === 0 ? (
                        <div style={styles.empty}>
                            <span style={{ fontSize: '40px' }}>📝</span>
                            <p>No quizzes found</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>
                                Try different filters or create your own!
                            </p>
                        </div>
                    ) : (
                        quizzes.map((quiz, index) => (
                            <Motion.div
                                key={quiz._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={styles.quizCard}
                                onClick={() => startQuiz(quiz)}
                            >
                                <div style={styles.quizInfo}>
                                    <div style={styles.quizTitle}>{quiz.title}</div>
                                    <div style={styles.quizMeta}>
                                        <span style={{ color: getDifficultyColor(quiz.difficulty) }}>
                                            {quiz.difficulty}
                                        </span>
                                        <span>•</span>
                                        <span>{quiz.questions?.length || 0} questions</span>
                                        <span>•</span>
                                        <span>by {quiz.createdBy?.name || 'Anonymous'}</span>
                                    </div>
                                    {quiz.description && (
                                        <div style={styles.quizDesc}>{quiz.description}</div>
                                    )}
                                </div>
                                <div style={styles.quizStats}>
                                    {quiz.timesCompleted > 0 && (
                                        <div style={styles.statBadge}>
                                            {quiz.timesCompleted} plays
                                        </div>
                                    )}
                                    <button style={styles.startBtn}>Start →</button>
                                </div>
                            </Motion.div>
                        ))
                    )}
                </div>
            </Motion.div>
        </Motion.div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    panel: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    quizPanel: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        padding: '25px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        color: '#fff'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#888',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '5px',
        lineHeight: 1
    },
    filters: {
        display: 'flex',
        gap: '10px',
        padding: '15px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    filterSelect: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#fff',
        fontSize: '13px'
    },
    list: {
        padding: '15px',
        overflowY: 'auto',
        flex: 1
    },
    loading: {
        textAlign: 'center',
        color: '#888',
        padding: '40px'
    },
    empty: {
        textAlign: 'center',
        padding: '40px',
        color: '#888'
    },
    quizCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        borderRadius: '12px',
        marginBottom: '10px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    quizInfo: {
        flex: 1
    },
    quizTitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: '15px',
        marginBottom: '4px'
    },
    quizMeta: {
        display: 'flex',
        gap: '8px',
        color: '#888',
        fontSize: '12px'
    },
    quizDesc: {
        color: '#666',
        fontSize: '12px',
        marginTop: '6px'
    },
    quizStats: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    statBadge: {
        background: 'rgba(102, 126, 234, 0.15)',
        color: '#667eea',
        padding: '4px 8px',
        borderRadius: '10px',
        fontSize: '11px'
    },
    startBtn: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold'
    },
    quizHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    quizProgress: {
        color: '#888',
        fontSize: '14px'
    },
    progressBar: {
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        marginBottom: '25px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea, #764ba2)',
        transition: 'width 0.3s ease'
    },
    questionText: {
        color: '#fff',
        fontSize: '18px',
        fontWeight: '500',
        marginBottom: '25px',
        lineHeight: '1.5'
    },
    optionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    optionBtn: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '14px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s'
    },
    resultsContainer: {
        padding: '40px 30px',
        textAlign: 'center'
    },
    scoreCircle: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 25px'
    },
    scoreValue: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#fff'
    },
    resultsTitle: {
        color: '#fff',
        fontSize: '24px',
        margin: '0 0 10px'
    },
    resultsSubtitle: {
        color: '#888',
        fontSize: '14px',
        marginBottom: '30px'
    },
    closeResultsBtn: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        color: '#fff',
        padding: '12px 30px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    }
};

export default QuizBrowser;
