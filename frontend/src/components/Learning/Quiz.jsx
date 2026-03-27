import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/**
 * Quiz - Interactive quiz component with encouraging feedback
 * No harsh failures - allows retries and shows explanations
 */

const Quiz = ({ questions, onComplete, onBack, lessonTitle }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);

    const totalQuestions = questions.length;
    const question = questions[currentQuestion];

    // Guard: If we've gone past all questions, show completion state
    if (!question) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Quiz Complete!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Processing your results...</p>
                </div>
            </div>
        );
    }

    const isCorrect = selectedAnswer === question.correct;



    // Handle answer selection
    const handleSelect = (index) => {
        if (showResult) return;
        setSelectedAnswer(index);
    };

    // Submit answer
    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setShowResult(true);
        setShowExplanation(true);
    };

    // Move to next question
    const handleNext = () => {
        const newAnswers = [...answers, selectedAnswer];
        setAnswers(newAnswers);

        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
            setShowExplanation(false);
        } else {
            // Quiz complete - calculate final score
            const finalScore = Math.round(
                ((newAnswers.filter((a, i) => questions[i] && a === questions[i].correct).length) / totalQuestions) * 100
            );
            onComplete(finalScore);
        }
    };

    // Retry current question
    const handleRetry = () => {
        setSelectedAnswer(null);
        setShowResult(false);
        setShowExplanation(false);
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <button onClick={onBack} style={styles.backBtn}>← Back to Lesson</button>
                <h2 style={styles.title}>📝 Quiz: {lessonTitle}</h2>
                <div style={styles.progress}>
                    Question {currentQuestion + 1} of {totalQuestions}
                </div>
            </header>

            {/* Progress bar */}
            <div style={styles.progressBar}>
                <Motion.div
                    style={styles.progressFill}
                    animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
                <Motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    style={styles.questionCard}
                >
                    <h3 style={styles.questionText}>{question.question}</h3>

                    {/* Options */}
                    <div style={styles.options}>
                        {question.options.map((option, index) => {
                            let optionStyle = { ...styles.option };

                            if (showResult) {
                                if (index === question.correct) {
                                    optionStyle = { ...optionStyle, ...styles.correctOption };
                                } else if (index === selectedAnswer && !isCorrect) {
                                    optionStyle = { ...optionStyle, ...styles.wrongOption };
                                }
                            } else if (index === selectedAnswer) {
                                optionStyle = { ...optionStyle, ...styles.selectedOption };
                            }

                            return (
                                <Motion.div
                                    key={index}
                                    whileHover={!showResult ? { scale: 1.02 } : {}}
                                    whileTap={!showResult ? { scale: 0.98 } : {}}
                                    onClick={() => handleSelect(index)}
                                    style={optionStyle}
                                >
                                    <span style={styles.optionLetter}>
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span style={styles.optionText}>{option}</span>
                                    {showResult && index === question.correct && (
                                        <span style={styles.checkmark}>✓</span>
                                    )}
                                </Motion.div>
                            );
                        })}
                    </div>

                    {/* Result feedback */}
                    {showResult && (
                        <Motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={isCorrect ? styles.correctFeedback : styles.wrongFeedback}
                        >
                            {isCorrect ? (
                                <>
                                    <span style={styles.feedbackIcon}>🎉</span>
                                    <span>Great job! That's correct!</span>
                                </>
                            ) : (
                                <>
                                    <span style={styles.feedbackIcon}>💪</span>
                                    <span>Almost! The correct answer is highlighted above.</span>
                                </>
                            )}
                        </Motion.div>
                    )}

                    {/* Explanation */}
                    {showExplanation && question.explanation && (
                        <Motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={styles.explanation}
                        >
                            <strong>💡 Explanation:</strong> {question.explanation}
                        </Motion.div>
                    )}
                </Motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div style={styles.actions}>
                {!showResult ? (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        style={{
                            ...styles.submitBtn,
                            opacity: selectedAnswer === null ? 0.5 : 1
                        }}
                    >
                        Check Answer
                    </button>
                ) : (
                    <div style={styles.resultActions}>
                        {!isCorrect && (
                            <button onClick={handleRetry} style={styles.retryBtn}>
                                Try Again
                            </button>
                        )}
                        <button onClick={handleNext} style={styles.nextBtn}>
                            {currentQuestion < totalQuestions - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px'
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    title: {
        margin: 0,
        fontSize: '18px',
        flex: 1
    },
    progress: {
        color: 'var(--text-muted)',
        fontSize: '14px'
    },
    progressBar: {
        height: '6px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
        marginBottom: '30px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-purple))',
        borderRadius: '3px'
    },
    questionCard: {
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '700px',
        margin: '0 auto',
        flex: 1
    },
    questionText: {
        margin: '0 0 25px 0',
        fontSize: '20px',
        lineHeight: '1.5'
    },
    options: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px 20px',
        background: 'var(--bg-muted)',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    selectedOption: {
        borderColor: 'var(--accent-teal)',
        background: 'rgba(13, 148, 136, 0.1)'
    },
    correctOption: {
        borderColor: 'var(--accent-green)',
        background: 'rgba(72, 187, 120, 0.15)'
    },
    wrongOption: {
        borderColor: '#f56565',
        background: 'rgba(245, 101, 101, 0.15)'
    },
    optionLetter: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    optionText: {
        flex: 1,
        fontSize: '15px'
    },
    checkmark: {
        color: 'var(--accent-green)',
        fontSize: '20px',
        fontWeight: 'bold'
    },
    correctFeedback: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(72, 187, 120, 0.15)',
        border: '1px solid rgba(72, 187, 120, 0.3)',
        borderRadius: '10px',
        color: 'var(--accent-green)',
        fontSize: '15px'
    },
    wrongFeedback: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(246, 173, 85, 0.15)',
        border: '1px solid rgba(246, 173, 85, 0.3)',
        borderRadius: '10px',
        color: 'var(--accent-yellow)',
        fontSize: '15px'
    },
    feedbackIcon: {
        fontSize: '24px'
    },
    explanation: {
        marginTop: '15px',
        padding: '15px',
        background: 'rgba(13, 148, 136, 0.1)',
        border: '1px solid rgba(13, 148, 136, 0.2)',
        borderRadius: '10px',
        color: '#d1d5db',
        fontSize: '14px',
        lineHeight: '1.6'
    },
    actions: {
        marginTop: '30px',
        display: 'flex',
        justifyContent: 'center'
    },
    submitBtn: {
        background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))',
        color: 'var(--text-primary)',
        border: 'none',
        padding: '14px 40px',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    resultActions: {
        display: 'flex',
        gap: '15px'
    },
    retryBtn: {
        background: 'transparent',
        border: '2px solid rgba(255,255,255,0.2)',
        color: 'var(--text-primary)',
        padding: '14px 30px',
        borderRadius: '10px',
        fontSize: '15px',
        cursor: 'pointer'
    },
    nextBtn: {
        background: 'linear-gradient(135deg, var(--accent-green), #38a169)',
        color: 'var(--text-primary)',
        border: 'none',
        padding: '14px 30px',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};

export default Quiz;
