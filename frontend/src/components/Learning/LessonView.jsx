import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Quiz from './Quiz';
import Canvas from '../Visualizer/Canvas';
import DiscussionPanel from '../Social/DiscussionPanel';

/**
 * LessonView - Full lesson display with explanation, code, and quiz
 * Supports multi-language toggle, compare mode, and VISUAL CODE EXECUTION
 */

const LANGUAGE_ICONS = {
    python: '🐍',
    javascript: '📜',
    java: '☕',
    cpp: '⚙️'
};

const LANGUAGE_MAP = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp'
};

const LessonView = ({ path, lesson, onBack, onComplete, progress }) => {
    const [selectedLang, setSelectedLang] = useState('python');
    const [compareLang, setCompareLang] = useState('javascript');
    const [compareMode, setCompareMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);

    // Visual execution state
    const [showVisualizer, setShowVisualizer] = useState(false);
    const [traceData, setTraceData] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const availableLanguages = Object.keys(lesson.code || {});
    const explanationSteps = lesson.explanation || [];

    // Run code through tracer
    const handleRunVisualize = async () => {
        const code = lesson.code?.[selectedLang];
        if (!code) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5001/trace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    language: LANGUAGE_MAP[selectedLang] || 'python'
                })
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else if (data.trace && data.trace.length > 0) {
                setTraceData(data.trace);
                setStepIndex(0);
                setShowVisualizer(true);
            } else {
                setError('No trace data received');
            }
        } catch (err) {
            setError('Failed to connect to server: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle quiz completion
    const handleQuizComplete = (score) => {
        onComplete(score);
    };

    // Show quiz after explanation
    if (showQuiz && lesson.quiz) {
        return (
            <Quiz
                questions={lesson.quiz}
                onComplete={handleQuizComplete}
                onBack={() => setShowQuiz(false)}
                lessonTitle={lesson.title}
            />
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <button onClick={onBack} style={styles.backBtn}>← Back to Lessons</button>
                <h2 style={styles.title}>{lesson.title}</h2>
                <span style={styles.duration}>⏱ {lesson.duration}</span>
            </header>

            {/* Language Toggle Bar */}
            <div style={styles.languageBar}>
                <div style={styles.languageSelector}>
                    <span style={styles.languageLabel}>Language:</span>
                    {availableLanguages.map(lang => (
                        <button
                            key={lang}
                            onClick={() => {
                                setSelectedLang(lang);
                                setShowVisualizer(false);
                                setTraceData(null);
                            }}
                            style={{
                                ...styles.langBtn,
                                background: selectedLang === lang ? '#667eea' : 'transparent'
                            }}
                        >
                            {LANGUAGE_ICONS[lang]} {lang}
                        </button>
                    ))}
                </div>

                <div style={styles.rightControls}>
                    {/* Run & Visualize Button */}
                    <button
                        onClick={handleRunVisualize}
                        disabled={isLoading}
                        style={styles.visualizeBtn}
                    >
                        {isLoading ? '⏳ Running...' : '▶ Run & Visualize'}
                    </button>

                    {availableLanguages.length > 1 && (
                        <label style={styles.compareToggle}>
                            <input
                                type="checkbox"
                                checked={compareMode}
                                onChange={(e) => setCompareMode(e.target.checked)}
                                style={styles.checkbox}
                            />
                            Compare
                        </label>
                    )}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div style={styles.errorBox}>
                    ⚠️ {error}
                </div>
            )}

            {/* Main Content */}
            <div style={styles.content}>
                {/* Left: Explanation */}
                <div style={styles.explanationPanel}>
                    <h3 style={styles.sectionTitle}>📖 Explanation</h3>

                    <div style={styles.explanationContent}>
                        {explanationSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={styles.explanationStep}
                            >
                                {step.type === 'text' && (
                                    <p style={styles.textContent}
                                        dangerouslySetInnerHTML={{ __html: step.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                    />
                                )}
                                {step.type === 'tip' && (
                                    <div style={styles.tipBox}>
                                        💡 <strong>Tip:</strong> {step.content}
                                    </div>
                                )}
                                {step.type === 'warning' && (
                                    <div style={styles.warningBox}>
                                        ⚠️ <strong>Important:</strong> {step.content}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Key Concepts */}
                    {lesson.keyConcepts && (
                        <div style={styles.keyConceptsBox}>
                            <h4 style={styles.keyConceptsTitle}>🎯 Key Concepts</h4>
                            <ul style={styles.keyConceptsList}>
                                {lesson.keyConcepts.map((concept, i) => (
                                    <li key={i}>{concept}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right: Code Panel OR Visualizer */}
                <div style={styles.codePanel}>
                    {/* Toggle between Code and Visualizer */}
                    <div style={styles.panelHeader}>
                        <button
                            onClick={() => setShowVisualizer(false)}
                            style={{
                                ...styles.tabBtn,
                                background: !showVisualizer ? '#667eea' : 'transparent'
                            }}
                        >
                            🖥️ Code
                        </button>
                        <button
                            onClick={() => traceData && setShowVisualizer(true)}
                            disabled={!traceData}
                            style={{
                                ...styles.tabBtn,
                                background: showVisualizer ? '#667eea' : 'transparent',
                                opacity: traceData ? 1 : 0.5
                            }}
                        >
                            👁️ Visualizer
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {showVisualizer && traceData ? (
                            <motion.div
                                key="visualizer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={styles.visualizerWrapper}
                            >
                                <Canvas
                                    traceData={traceData}
                                    stepIndex={stepIndex}
                                    setStepIndex={setStepIndex}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="code"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {!compareMode ? (
                                    // Single language view
                                    <div style={styles.codeBox}>
                                        <div style={styles.codeHeader}>
                                            {LANGUAGE_ICONS[selectedLang]} {selectedLang}
                                        </div>
                                        <pre style={styles.code}>
                                            {lesson.code?.[selectedLang] || 'No code available for this language'}
                                        </pre>
                                    </div>
                                ) : (
                                    // Compare mode - side by side
                                    <div style={styles.compareContainer}>
                                        <div style={styles.comparePane}>
                                            <div style={styles.codeHeader}>
                                                {LANGUAGE_ICONS[selectedLang]} {selectedLang}
                                            </div>
                                            <pre style={styles.code}>
                                                {lesson.code?.[selectedLang] || 'N/A'}
                                            </pre>
                                        </div>
                                        <div style={styles.compareDivider} />
                                        <div style={styles.comparePane}>
                                            <div style={styles.codeHeader}>
                                                <select
                                                    value={compareLang}
                                                    onChange={(e) => setCompareLang(e.target.value)}
                                                    style={styles.compareSelect}
                                                >
                                                    {availableLanguages.filter(l => l !== selectedLang).map(lang => (
                                                        <option key={lang} value={lang}>{LANGUAGE_ICONS[lang]} {lang}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <pre style={styles.code}>
                                                {lesson.code?.[compareLang] || 'N/A'}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Syntax difference tip */}
                                {compareMode && lesson.syntaxDiff && (
                                    <div style={styles.syntaxDiffBox}>
                                        <strong>💡 Syntax Difference:</strong> {lesson.syntaxDiff}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Discussion Section */}
            <DiscussionPanel lessonId={lesson.id} />

            {/* Footer - Continue button */}
            <div style={styles.footer}>
                <div style={styles.progressDots}>
                    {explanationSteps.map((_, i) => (
                        <span
                            key={i}
                            style={{
                                ...styles.dot,
                                background: i <= currentStep ? '#667eea' : '#444'
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={() => lesson.quiz ? setShowQuiz(true) : onComplete(100)}
                    style={styles.continueBtn}
                >
                    {lesson.quiz ? 'Take Quiz →' : 'Complete Lesson →'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '15px',
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
        fontSize: '20px',
        flex: 1
    },
    duration: {
        color: '#888',
        fontSize: '14px'
    },
    languageBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 15px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        marginBottom: '20px'
    },
    languageSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    languageLabel: {
        color: '#888',
        fontSize: '13px'
    },
    langBtn: {
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        textTransform: 'capitalize',
        transition: 'all 0.2s'
    },
    rightControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    visualizeBtn: {
        background: 'linear-gradient(135deg, #48bb78, #38a169)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    compareToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#888',
        fontSize: '13px',
        cursor: 'pointer'
    },
    checkbox: {
        accentColor: '#667eea'
    },
    errorBox: {
        background: 'rgba(245, 101, 101, 0.15)',
        border: '1px solid rgba(245, 101, 101, 0.3)',
        borderRadius: '8px',
        padding: '10px 15px',
        marginBottom: '15px',
        color: '#f56565',
        fontSize: '13px'
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        flex: 1,
        minHeight: 0
    },
    explanationPanel: {
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'auto'
    },
    sectionTitle: {
        margin: '0 0 15px 0',
        fontSize: '14px',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    explanationContent: {
        lineHeight: '1.7'
    },
    explanationStep: {
        marginBottom: '15px'
    },
    textContent: {
        margin: 0,
        color: '#e0e0e0',
        fontSize: '14px'
    },
    tipBox: {
        background: 'rgba(72, 187, 120, 0.1)',
        border: '1px solid rgba(72, 187, 120, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        color: '#48bb78'
    },
    warningBox: {
        background: 'rgba(246, 173, 85, 0.1)',
        border: '1px solid rgba(246, 173, 85, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '13px',
        color: '#f6ad55'
    },
    keyConceptsBox: {
        marginTop: '20px',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '10px',
        padding: '15px'
    },
    keyConceptsTitle: {
        margin: '0 0 10px 0',
        fontSize: '13px',
        color: '#a78bfa'
    },
    keyConceptsList: {
        margin: 0,
        paddingLeft: '20px',
        color: '#d1d5db',
        fontSize: '13px'
    },
    codePanel: {
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    panelHeader: {
        display: 'flex',
        gap: '10px',
        marginBottom: '15px'
    },
    tabBtn: {
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'all 0.2s'
    },
    visualizerWrapper: {
        flex: 1,
        overflow: 'auto',
        background: '#1e1e1e',
        borderRadius: '8px'
    },
    codeBox: {
        background: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    codeHeader: {
        background: 'rgba(255,255,255,0.05)',
        padding: '8px 12px',
        fontSize: '12px',
        color: '#888',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        textTransform: 'capitalize'
    },
    code: {
        margin: 0,
        padding: '15px',
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        overflow: 'auto',
        maxHeight: '350px'
    },
    compareContainer: {
        display: 'flex',
        gap: '2px',
        background: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    comparePane: {
        flex: 1
    },
    compareDivider: {
        width: '2px',
        background: 'rgba(255,255,255,0.1)'
    },
    compareSelect: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '12px',
        cursor: 'pointer'
    },
    syntaxDiffBox: {
        marginTop: '15px',
        background: 'rgba(102, 126, 234, 0.1)',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#a78bfa'
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
    },
    progressDots: {
        display: 'flex',
        gap: '6px'
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%'
    },
    continueBtn: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        padding: '12px 30px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.2s'
    }
};

export default LessonView;
