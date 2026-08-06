import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Quiz from './Quiz';
import ConceptPlayer from './ConceptPlayer';
import DiagramPlayer from './DiagramPlayer';
import { getVisual } from '../../data/visuals';
import Canvas from '../Visualizer/Canvas';

// Route a visual spec to the right player by its kind.
const VisualBlock = ({ spec }) => (
    spec.kind === 'diagram' ? <DiagramPlayer spec={spec} /> : <ConceptPlayer spec={spec} />
);
import DiscussionPanel from '../Social/DiscussionPanel';
import API_BASE, { API } from '../../utils/api';

/**
 * LessonView - Full lesson display with explanation, code, and quiz
 * Supports multi-language toggle, compare mode, and VISUAL CODE EXECUTION
 */

const LANGUAGE_ICONS = {
    python: '🐍',
    javascript: '📜',
    java: '☕',
    cpp: '⚙️',
    typescript: '📘',
    go: '🔵',
    c: '🔷'
};

const LANGUAGE_MAP = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    typescript: 'typescript',
    go: 'go',
    c: 'c'
};

// Languages whose lesson code the tracer can meaningfully step through.
const TRACEABLE_LANGS = ['python', 'javascript', 'java', 'cpp', 'c'];

const LessonView = ({ lesson, onBack, onComplete, preferredLanguage = 'javascript', slug, autoVisualize = false }) => {
    const availableLanguages = Object.keys(lesson.code || {});
    
    // Initialize with preferred language if available, else first available
    const initialLang = availableLanguages.includes(preferredLanguage) 
        ? preferredLanguage 
        : (availableLanguages[0] || 'javascript');

    const [selectedLang, setSelectedLang] = useState(initialLang);
    const [compareLang, setCompareLang] = useState(availableLanguages.find(l => l !== initialLang) || 'javascript');
    const [compareMode, setCompareMode] = useState(false);
    const [currentStep] = useState(0); // Removed unused setCurrentStep
    const [showQuiz, setShowQuiz] = useState(false);

    // Visual execution state
    const [showVisualizer, setShowVisualizer] = useState(false);
    const [traceData, setTraceData] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const explanationSteps = lesson.explanation || [];
    // Hand-authored visual (registry) wins; otherwise use the AI-generated one
    // stored on the lesson (Phase 4).
    const conceptVisual = getVisual(slug, lesson.id) || lesson.visual || null;

    // Run code through tracer
    const handleRunVisualize = async () => {
        const code = lesson.code?.[selectedLang];
        if (!code) return;

        setIsLoading(true);
        setError(null);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const response = await fetch(`${API_BASE}/trace`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    // Phase 1: auto-play the concept animation for algorithm/data-structure
    // lessons (category-gated by the parent) so learners SEE the topic run the
    // moment they open the lesson — no button press needed. Conceptual lessons
    // (Git, SQL, System Design…) skip this since their code isn't traceable.
    useEffect(() => {
        if (!autoVisualize) return;
        if (!TRACEABLE_LANGS.includes(selectedLang)) return;
        if (!lesson.code?.[selectedLang]) return;
        handleRunVisualize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson.id, selectedLang, autoVisualize]);

    // Handle quiz completion
    const handleQuizComplete = (score) => {
        onComplete(score);
    };

    // Server-side grading (answer keys never reach the client).
    const gradeQuiz = async (answers) => {
        const { data } = await API.post(`/api/courses/${slug}/lessons/${lesson.id}/quiz`, { answers });
        return data; // { score, results }
    };

    // Show quiz after explanation
    if (showQuiz && lesson.quiz) {
        return (
            <Quiz
                questions={lesson.quiz}
                onComplete={handleQuizComplete}
                onGrade={slug ? gradeQuiz : undefined}
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
                                background: selectedLang === lang ? 'var(--cz-accent)' : 'transparent',
                                color: selectedLang === lang ? 'var(--cz-accent-fg, #fff)' : 'var(--cz-text)',
                                borderColor: selectedLang === lang ? 'var(--cz-accent)' : 'var(--cz-line)',
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

                    {/* Concept animation (Phase 2): a hand-authored, step-by-step
                        animated explanation of this concept, if one exists. */}
                    {conceptVisual && <VisualBlock spec={conceptVisual} />}

                    <div style={styles.explanationContent}>
                        {explanationSteps.map((step, idx) => (
                            step.type === 'visual' ? (
                                <VisualBlock key={idx} spec={step} />
                            ) : (
                            <Motion.div
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
                            </Motion.div>
                            )
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
                                background: !showVisualizer ? 'var(--cz-accent)' : 'transparent',
                                color: !showVisualizer ? 'var(--cz-accent-fg, #fff)' : 'var(--cz-text)',
                                borderColor: !showVisualizer ? 'var(--cz-accent)' : 'var(--cz-line)',
                            }}
                        >
                            🖥️ Code
                        </button>
                        <button
                            onClick={() => traceData && setShowVisualizer(true)}
                            disabled={!traceData}
                            style={{
                                ...styles.tabBtn,
                                background: showVisualizer ? 'var(--cz-accent)' : 'transparent',
                                color: showVisualizer ? 'var(--cz-accent-fg, #fff)' : 'var(--cz-text)',
                                borderColor: showVisualizer ? 'var(--cz-accent)' : 'var(--cz-line)',
                                opacity: traceData ? 1 : 0.5
                            }}
                        >
                            👁️ Visualizer
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {showVisualizer && traceData ? (
                            <Motion.div
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
                            </Motion.div>
                        ) : (
                            <Motion.div
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
                            </Motion.div>
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
                                background: i <= currentStep ? 'var(--cz-accent)' : 'var(--cz-line)'
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

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";

const styles = {
    container: {
        minHeight: '100%',
        background: 'transparent',
        color: 'var(--cz-text)',
        padding: '28px 24px 60px',
        maxWidth: '1120px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        marginBottom: '20px',
        paddingBottom: '18px',
        borderBottom: '1px solid var(--cz-line)',
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid var(--cz-line)',
        color: 'var(--cz-muted)',
        padding: '8px 16px',
        borderRadius: '100px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s',
        fontFamily: FONT,
    },
    title: {
        margin: 0,
        fontSize: '27px',
        fontWeight: 800,
        flex: 1,
        letterSpacing: '-0.02em',
        color: 'var(--cz-text)',
    },
    duration: {
        color: 'var(--cz-accent)',
        fontSize: '12px',
        fontWeight: 700,
        background: 'color-mix(in srgb, var(--cz-accent) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--cz-accent) 28%, transparent)',
        padding: '6px 14px',
        borderRadius: '100px',
        whiteSpace: 'nowrap',
    },
    languageBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 14px',
        background: 'var(--cz-surface)',
        border: '1px solid var(--cz-line)',
        borderRadius: '14px',
        boxShadow: 'var(--cz-shadow-sm)',
        marginBottom: '18px',
    },
    languageSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        flexWrap: 'wrap',
    },
    languageLabel: {
        color: 'var(--cz-faint)',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginRight: '4px',
    },
    langBtn: {
        border: '1px solid var(--cz-line)',
        color: 'var(--cz-text)',
        padding: '7px 13px',
        borderRadius: '9px',
        cursor: 'pointer',
        fontSize: '12.5px',
        fontWeight: 700,
        textTransform: 'capitalize',
        transition: 'all 0.15s',
        fontFamily: FONT,
    },
    rightControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    visualizeBtn: {
        background: 'linear-gradient(135deg, var(--cz-accent), #7c93ff)',
        color: 'var(--cz-accent-fg, #fff)',
        border: 'none',
        padding: '9px 16px',
        borderRadius: '9px',
        fontSize: '12.5px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: FONT,
    },
    compareToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        color: 'var(--cz-muted)',
        fontSize: '12.5px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    checkbox: {
        accentColor: 'var(--cz-accent)',
    },
    errorBox: {
        background: 'color-mix(in srgb, var(--cz-hard) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--cz-hard) 35%, transparent)',
        borderRadius: '10px',
        padding: '11px 15px',
        marginBottom: '15px',
        color: 'var(--cz-hard)',
        fontSize: '13px',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '18px',
        flex: 1,
        minHeight: 0,
    },
    explanationPanel: {
        background: 'var(--cz-surface)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--cz-line)',
        boxShadow: 'var(--cz-shadow-sm)',
        overflow: 'auto',
    },
    sectionTitle: {
        margin: '0 0 14px 0',
        fontSize: '11px',
        fontWeight: 800,
        color: 'var(--cz-faint)',
        textTransform: 'uppercase',
        letterSpacing: '1.4px',
    },
    explanationContent: {
        lineHeight: '1.7',
    },
    explanationStep: {
        marginBottom: '14px',
    },
    textContent: {
        margin: 0,
        color: 'var(--cz-text)',
        fontSize: '14.5px',
        lineHeight: 1.65,
    },
    tipBox: {
        background: 'color-mix(in srgb, var(--cz-success) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--cz-success) 30%, transparent)',
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '13.5px',
        color: 'var(--cz-text)',
    },
    warningBox: {
        background: 'color-mix(in srgb, var(--cz-warning) 14%, transparent)',
        border: '1px solid color-mix(in srgb, var(--cz-warning) 32%, transparent)',
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '13.5px',
        color: 'var(--cz-text)',
    },
    keyConceptsBox: {
        marginTop: '18px',
        background: 'color-mix(in srgb, var(--cz-accent) 8%, var(--cz-elevated))',
        border: '1px solid color-mix(in srgb, var(--cz-accent) 22%, transparent)',
        borderRadius: '12px',
        padding: '15px 16px',
    },
    keyConceptsTitle: {
        margin: '0 0 10px 0',
        fontSize: '12px',
        fontWeight: 800,
        color: 'var(--cz-accent)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    keyConceptsList: {
        margin: 0,
        paddingLeft: '18px',
        color: 'var(--cz-muted)',
        fontSize: '13.5px',
        lineHeight: 1.7,
    },
    codePanel: {
        background: 'var(--cz-surface)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--cz-line)',
        boxShadow: 'var(--cz-shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    panelHeader: {
        display: 'flex',
        gap: '8px',
        marginBottom: '14px',
    },
    tabBtn: {
        border: '1px solid var(--cz-line)',
        color: 'var(--cz-text)',
        padding: '7px 14px',
        borderRadius: '9px',
        cursor: 'pointer',
        fontSize: '12.5px',
        fontWeight: 700,
        transition: 'all 0.15s',
        fontFamily: FONT,
    },
    visualizerWrapper: {
        flex: 1,
        overflow: 'auto',
        background: 'var(--cz-elevated)',
        borderRadius: '12px',
        border: '1px solid var(--cz-line)',
    },
    codeBox: {
        background: 'var(--cz-elevated)',
        border: '1px solid var(--cz-line)',
        borderRadius: '12px',
        overflow: 'hidden',
    },
    codeHeader: {
        background: 'var(--cz-surface)',
        padding: '9px 14px',
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--cz-muted)',
        borderBottom: '1px solid var(--cz-line)',
        textTransform: 'capitalize',
        fontFamily: MONO,
    },
    code: {
        margin: 0,
        padding: '15px',
        fontSize: '13px',
        fontFamily: MONO,
        color: 'var(--cz-text)',
        overflow: 'auto',
        maxHeight: '360px',
        lineHeight: 1.6,
    },
    compareContainer: {
        display: 'flex',
        gap: '2px',
        background: 'var(--cz-line)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--cz-line)',
    },
    comparePane: {
        flex: 1,
        background: 'var(--cz-elevated)',
    },
    compareDivider: {
        width: '1px',
        background: 'var(--cz-line)',
    },
    compareSelect: {
        background: 'transparent',
        border: 'none',
        color: 'var(--cz-text)',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: MONO,
    },
    syntaxDiffBox: {
        marginTop: '14px',
        background: 'color-mix(in srgb, var(--cz-accent) 8%, var(--cz-elevated))',
        border: '1px solid color-mix(in srgb, var(--cz-accent) 22%, transparent)',
        padding: '12px 14px',
        borderRadius: '10px',
        fontSize: '12.5px',
        color: 'var(--cz-text)',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '22px',
        paddingTop: '18px',
        borderTop: '1px solid var(--cz-line)',
    },
    progressDots: {
        display: 'flex',
        gap: '6px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
    },
    continueBtn: {
        background: 'linear-gradient(135deg, var(--cz-accent), #7c93ff)',
        color: 'var(--cz-accent-fg, #fff)',
        border: 'none',
        padding: '12px 28px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        fontFamily: FONT,
    },
};

export default LessonView;
