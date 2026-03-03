import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API = 'http://localhost:5001';

const LANGUAGES = [
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'javascript', label: 'JavaScript', icon: '⚡' },
    { id: 'java', label: 'Java', icon: '☕' },
    { id: 'cpp', label: 'C++', icon: '⚙️' },
];

const Translator = () => {
    const [sourceCode, setSourceCode] = useState(`def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

result = fibonacci(10)
print(result)`);
    const [sourceLanguage, setSourceLanguage] = useState('python');
    const [targetLanguage, setTargetLanguage] = useState('javascript');
    const [translation, setTranslation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hoveredMapping, setHoveredMapping] = useState(null);

    const getToken = () => {
        const info = localStorage.getItem('userInfo');
        return info ? JSON.parse(info).token : '';
    };
    const headers = { Authorization: `Bearer ${getToken()}` };

    const translateCode = async () => {
        if (sourceLanguage === targetLanguage) return;
        setLoading(true);
        setTranslation(null);
        try {
            const { data } = await axios.post(`${API}/api/ai/translate`, {
                code: sourceCode,
                sourceLanguage,
                targetLanguage,
            }, { headers });
            setTranslation(data.translation);
        } catch (err) {
            console.error('Translate error:', err);
        }
        setLoading(false);
    };

    const swapLanguages = () => {
        if (translation?.translatedCode) {
            setSourceCode(translation.translatedCode);
        }
        const temp = sourceLanguage;
        setSourceLanguage(targetLanguage);
        setTargetLanguage(temp);
        setTranslation(null);
    };

    const getMonacoLang = (lang) => lang === 'cpp' ? 'cpp' : lang;

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}><span>🌐</span> Code Translator</h1>
                    <p style={styles.subtitle}>Translate code between languages with line-by-line mapping</p>
                </div>
                <button onClick={translateCode} disabled={loading || sourceLanguage === targetLanguage} style={{
                    ...styles.translateBtn,
                    opacity: loading || sourceLanguage === targetLanguage ? 0.5 : 1,
                }}>
                    {loading ? '⏳ Translating...' : '🌐 Translate'}
                </button>
            </div>

            {/* Language Selectors */}
            <div style={styles.langRow}>
                <div style={styles.langGroup}>
                    <span style={styles.langLabel}>Source</span>
                    <div style={styles.langBtns}>
                        {LANGUAGES.map(l => (
                            <button key={l.id} onClick={() => { setSourceLanguage(l.id); setTranslation(null); }} style={{
                                ...styles.langBtn,
                                ...(sourceLanguage === l.id ? styles.langActive : {}),
                            }}>
                                {l.icon} {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={swapLanguages} style={styles.swapBtn} title="Swap languages">
                    ⇄
                </button>

                <div style={styles.langGroup}>
                    <span style={styles.langLabel}>Target</span>
                    <div style={styles.langBtns}>
                        {LANGUAGES.map(l => (
                            <button key={l.id} onClick={() => { setTargetLanguage(l.id); setTranslation(null); }} style={{
                                ...styles.langBtn,
                                ...(targetLanguage === l.id ? styles.langActive : {}),
                                ...(sourceLanguage === l.id ? styles.langDisabled : {}),
                            }} disabled={sourceLanguage === l.id}>
                                {l.icon} {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dual Editor */}
            <div style={styles.editorsGrid}>
                {/* Source Editor */}
                <div style={styles.editorPanel}>
                    <div style={styles.panelHeader}>
                        <span>{LANGUAGES.find(l => l.id === sourceLanguage)?.icon} {sourceLanguage}</span>
                        <span style={styles.lineCount}>{sourceCode.split('\n').length} lines</span>
                    </div>
                    <div style={styles.editorWrap}>
                        <Editor
                            height="100%"
                            language={getMonacoLang(sourceLanguage)}
                            value={sourceCode}
                            onChange={v => { setSourceCode(v || ''); setTranslation(null); }}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                padding: { top: 12 },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                </div>

                {/* Target Editor */}
                <div style={styles.editorPanel}>
                    <div style={styles.panelHeader}>
                        <span>{LANGUAGES.find(l => l.id === targetLanguage)?.icon} {targetLanguage}</span>
                        {translation?.translatedCode && (
                            <span style={styles.lineCount}>
                                {translation.translatedCode.split('\n').length} lines
                            </span>
                        )}
                    </div>
                    <div style={styles.editorWrap}>
                        {loading ? (
                            <div style={styles.loadingState}>
                                <div style={styles.spinner} />
                                <p>Translating to {targetLanguage}...</p>
                            </div>
                        ) : translation?.translatedCode ? (
                            <Editor
                                height="100%"
                                language={getMonacoLang(targetLanguage)}
                                value={translation.translatedCode}
                                theme="vs-dark"
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    padding: { top: 12 },
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    readOnly: true,
                                }}
                            />
                        ) : (
                            <div style={styles.emptyTarget}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌐</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                    Translated code will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Line Mapping */}
            {translation?.lineMapping && translation.lineMapping.length > 0 && (
                <div style={styles.mappingSection}>
                    <h3 style={styles.sectionTitle}>🔗 Line-by-Line Mapping</h3>
                    <div style={styles.mappingGrid}>
                        {translation.lineMapping.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.mappingCard,
                                    ...(hoveredMapping === m ? styles.mappingCardHover : {}),
                                }}
                                onMouseEnter={() => setHoveredMapping(m)}
                                onMouseLeave={() => setHoveredMapping(null)}
                            >
                                <div style={styles.mappingLines}>
                                    <span style={styles.mappingSource}>
                                        L{m.sourceLine}
                                    </span>
                                    <span style={styles.mappingArrow}>→</span>
                                    <span style={styles.mappingTarget}>
                                        L{(m.targetLines || []).join(', L')}
                                    </span>
                                </div>
                                <p style={styles.mappingExplain}>{m.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes & Warnings */}
            {translation && (
                <div style={styles.notesRow}>
                    {translation.notes && translation.notes.length > 0 && (
                        <div style={styles.notesCard}>
                            <h4 style={styles.notesTitle}>📝 Translation Notes</h4>
                            <ul style={styles.notesList}>
                                {translation.notes.map((n, i) => (
                                    <li key={i} style={styles.noteItem}>{n}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {translation.warnings && translation.warnings.length > 0 && (
                        <div style={{ ...styles.notesCard, ...styles.warningCard }}>
                            <h4 style={styles.notesTitle}>⚠️ Warnings</h4>
                            <ul style={styles.notesList}>
                                {translation.warnings.map((w, i) => (
                                    <li key={i} style={{ ...styles.noteItem, color: 'var(--accent-yellow)' }}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles = {
    page: { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '20px', flexWrap: 'wrap', gap: '16px',
    },
    title: {
        fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-bright)',
        display: 'flex', alignItems: 'center', gap: '12px',
    },
    subtitle: { color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' },
    translateBtn: {
        padding: '10px 28px', border: 'none', borderRadius: '10px',
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
        color: '#1E1E2E', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
        transition: 'var(--transition-fast)',
    },
    langRow: {
        display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap',
    },
    langGroup: {
        flex: 1, minWidth: '200px',
    },
    langLabel: {
        fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', display: 'block',
    },
    langBtns: {
        display: 'flex', gap: '4px', background: 'var(--bg-surface)',
        borderRadius: '8px', padding: '3px',
    },
    langBtn: {
        padding: '6px 14px', border: 'none', borderRadius: '6px', background: 'transparent',
        color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        transition: 'var(--transition-fast)', flex: 1, textAlign: 'center',
    },
    langActive: { background: 'var(--bg-elevated)', color: 'var(--accent-blue)' },
    langDisabled: { opacity: 0.3, cursor: 'not-allowed' },
    swapBtn: {
        width: '40px', height: '40px', border: '1px solid var(--border-color)',
        borderRadius: '50%', background: 'var(--bg-surface)', color: 'var(--accent-blue)',
        fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginTop: '20px', transition: 'var(--transition-fast)',
    },
    editorsGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '450px',
        marginBottom: '20px',
    },
    editorPanel: {
        background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
    },
    panelHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', borderBottom: '1px solid var(--border-color)',
        fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
    },
    lineCount: {
        fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-code)',
    },
    editorWrap: { flex: 1, minHeight: 0 },
    loadingState: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: 'var(--text-secondary)',
    },
    spinner: {
        width: '40px', height: '40px', border: '3px solid var(--border-color)',
        borderTopColor: 'var(--accent-cyan)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', marginBottom: '16px',
    },
    emptyTarget: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', textAlign: 'center',
    },
    mappingSection: { marginBottom: '20px' },
    sectionTitle: {
        fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)',
        marginBottom: '12px',
    },
    mappingGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px',
    },
    mappingCard: {
        padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: '10px',
        border: '1px solid var(--border-color)', cursor: 'default',
        transition: 'var(--transition-fast)',
    },
    mappingCardHover: {
        borderColor: 'var(--accent-blue)',
        background: 'var(--bg-hover)',
    },
    mappingLines: {
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
    },
    mappingSource: {
        fontFamily: 'var(--font-code)', fontSize: '12px', fontWeight: 700,
        color: 'var(--accent-blue)', background: 'rgba(97,218,251,0.1)',
        padding: '2px 6px', borderRadius: '4px',
    },
    mappingArrow: { color: 'var(--text-muted)', fontSize: '14px' },
    mappingTarget: {
        fontFamily: 'var(--font-code)', fontSize: '12px', fontWeight: 700,
        color: 'var(--accent-green)', background: 'rgba(152,195,121,0.1)',
        padding: '2px 6px', borderRadius: '4px',
    },
    mappingExplain: {
        margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4,
    },
    notesRow: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px',
    },
    notesCard: {
        padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
    warningCard: {
        borderColor: 'rgba(229,192,123,0.3)',
        background: 'rgba(229,192,123,0.05)',
    },
    notesTitle: {
        fontSize: '14px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '10px',
    },
    notesList: {
        margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px',
    },
    noteItem: {
        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5,
    },
};

export default Translator;
