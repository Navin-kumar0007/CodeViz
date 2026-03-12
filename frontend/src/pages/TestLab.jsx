import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import API_BASE from '../utils/api';

const API = API_BASE;

const TestLab = () => {
    const [code, setCode] = useState(`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`);
    const [language, setLanguage] = useState('python');
    const [tests, setTests] = useState(null);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState({});

    const getToken = () => {
        const info = localStorage.getItem('userInfo');
        return info ? JSON.parse(info).token : '';
    };
    const headers = { Authorization: `Bearer ${getToken()}` };

    const generateTests = async () => {
        setLoading(true);
        setTests(null);
        setResults({});
        try {
            const { data } = await axios.post(`${API}/api/ai/generate-tests`, { code, language }, { headers });
            setTests(data.tests);
        } catch (err) {
            console.error('Generate tests error:', err);
        }
        setLoading(false);
    };

    const runAllTests = async () => {
        if (!tests?.runnerCode) return;
        setRunning(true);

        try {
            const { data } = await axios.post(`${API}/execute`, {
                language,
                code: tests.runnerCode
            });

            const output = data.output || (data.trace && data.trace.length > 0 ? 'Executed' : '');
            const lines = output.split('\n').filter(l => l.trim());

            // Parse PASS/FAIL lines
            const newResults = {};
            if (tests.testCases) {
                tests.testCases.forEach((tc, i) => {
                    const matchLine = lines.find(l =>
                        l.toLowerCase().includes(tc.name.toLowerCase()) ||
                        l.includes(`Test ${i + 1}`)
                    );
                    if (matchLine) {
                        newResults[i] = matchLine.toLowerCase().includes('pass') ? 'pass' : 'fail';
                    } else if (i < lines.length) {
                        newResults[i] = lines[i]?.toLowerCase().includes('pass') ? 'pass' : 'fail';
                    }
                });
            }

            // If we couldn't parse individual results, mark all based on error presence
            if (Object.keys(newResults).length === 0 && tests.testCases) {
                const hasError = data.error || output.toLowerCase().includes('error');
                tests.testCases.forEach((_, i) => {
                    newResults[i] = hasError ? 'fail' : 'pass';
                });
            }

            setResults(newResults);
        } catch (err) {
            console.error('Run tests error:', err);
            if (tests?.testCases) {
                const failResults = {};
                tests.testCases.forEach((_, i) => { failResults[i] = 'fail'; });
                setResults(failResults);
            }
        }
        setRunning(false);
    };

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'normal': return '✅';
            case 'edge': return '🔲';
            case 'boundary': return '📏';
            case 'error': return '💥';
            default: return '🧪';
        }
    };

    const getCategoryColor = (cat) => {
        switch (cat) {
            case 'normal': return 'var(--accent-green)';
            case 'edge': return 'var(--accent-blue)';
            case 'boundary': return 'var(--accent-yellow)';
            case 'error': return 'var(--accent-red)';
            default: return 'var(--accent-purple)';
        }
    };

    const passCount = Object.values(results).filter(r => r === 'pass').length;
    const failCount = Object.values(results).filter(r => r === 'fail').length;
    const totalTests = tests?.testCases?.length || 0;

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}><span>🧪</span> Test Lab</h1>
                    <p style={styles.subtitle}>Write a function → AI generates edge cases + tests → Validate correctness</p>
                </div>
                <div style={styles.langSelect}>
                    {['python', 'javascript', 'java', 'cpp', 'typescript', 'go', 'c'].map(l => (
                        <button key={l} onClick={() => setLanguage(l)} style={{
                            ...styles.langBtn,
                            ...(language === l ? styles.langActive : {})
                        }}>{l}</button>
                    ))}
                </div>
            </div>

            {/* Main Layout */}
            <div style={styles.mainGrid}>
                {/* Editor Panel */}
                <div style={styles.editorPanel}>
                    <div style={styles.panelHeader}>
                        <span>📝 Your Function</span>
                        <button onClick={generateTests} disabled={loading} style={{
                            ...styles.genBtn,
                            opacity: loading ? 0.6 : 1,
                        }}>
                            {loading ? '⏳ Generating...' : '🧪 Generate Tests'}
                        </button>
                    </div>
                    <div style={styles.editorWrap}>
                        <Editor
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language}
                            value={code}
                            onChange={v => setCode(v || '')}
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

                {/* Test Results Panel */}
                <div style={styles.testPanel}>
                    {loading ? (
                        <div style={styles.loadingState}>
                            <div style={styles.spinner} />
                            <p>AI is generating test cases...</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Analyzing edge cases, boundary conditions, and error inputs
                            </p>
                        </div>
                    ) : tests && tests.testCases ? (
                        <>
                            {/* Test Header */}
                            <div style={styles.testHeader}>
                                <div>
                                    <h3 style={styles.funcName}>
                                        {tests.functionName || 'Function'}
                                    </h3>
                                    {tests.description && (
                                        <p style={styles.funcDesc}>{tests.description}</p>
                                    )}
                                </div>
                                <button onClick={runAllTests} disabled={running} style={{
                                    ...styles.runBtn,
                                    opacity: running ? 0.6 : 1,
                                }}>
                                    {running ? '⏳ Running...' : '▶ Run All Tests'}
                                </button>
                            </div>

                            {/* Results Bar */}
                            {Object.keys(results).length > 0 && (
                                <div style={styles.resultsBar}>
                                    <div style={styles.resultsBadge}>
                                        <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>
                                            ✅ {passCount} Pass
                                        </span>
                                        <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
                                            ❌ {failCount} Fail
                                        </span>
                                    </div>
                                    <div style={styles.resultProgress}>
                                        <div style={{
                                            ...styles.resultProgressFill,
                                            width: `${(passCount / totalTests) * 100}%`,
                                            background: passCount === totalTests
                                                ? 'var(--accent-green)'
                                                : 'linear-gradient(90deg, var(--accent-green), var(--accent-yellow))',
                                        }} />
                                    </div>
                                </div>
                            )}

                            {/* Test Cases List */}
                            <div style={styles.testList}>
                                {tests.testCases.map((tc, i) => (
                                    <div key={i} style={{
                                        ...styles.testCard,
                                        borderLeftColor: results[i] === 'pass' ? 'var(--accent-green)' :
                                            results[i] === 'fail' ? 'var(--accent-red)' :
                                                'var(--border-color)',
                                    }}>
                                        <div style={styles.testCardHeader}>
                                            <span style={styles.testName}>
                                                {results[i] === 'pass' ? '✅' : results[i] === 'fail' ? '❌' : '⬜'}
                                                {' '}{tc.name}
                                            </span>
                                            <span style={{
                                                ...styles.testCategory,
                                                color: getCategoryColor(tc.category),
                                                background: `${getCategoryColor(tc.category)}15`,
                                            }}>
                                                {getCategoryIcon(tc.category)} {tc.category}
                                            </span>
                                        </div>
                                        <div style={styles.testIO}>
                                            <div style={styles.testIORow}>
                                                <span style={styles.testIOLabel}>Input:</span>
                                                <code style={styles.testIOValue}>{tc.input}</code>
                                            </div>
                                            <div style={styles.testIORow}>
                                                <span style={styles.testIOLabel}>Expected:</span>
                                                <code style={styles.testIOValue}>{tc.expected}</code>
                                            </div>
                                        </div>
                                        {tc.explanation && (
                                            <p style={styles.testExplain}>{tc.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Runner Code Preview */}
                            {tests.runnerCode && (
                                <details style={styles.runnerDetails}>
                                    <summary style={styles.runnerSummary}>🔧 View Generated Test Runner Code</summary>
                                    <pre style={styles.runnerCode}>{tests.runnerCode}</pre>
                                </details>
                            )}
                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧪</div>
                            <h3 style={{ color: 'var(--text-bright)', margin: '0 0 8px' }}>Write a Function</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px', margin: '0 auto' }}>
                                Write a function in the editor, then click "Generate Tests" to create comprehensive test cases with edge cases.
                            </p>
                        </div>
                    )}
                </div>
            </div>

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
    langSelect: {
        display: 'flex', gap: '4px', background: 'var(--bg-surface)', borderRadius: '8px', padding: '3px',
    },
    langBtn: {
        padding: '6px 14px', border: 'none', borderRadius: '6px', background: 'transparent',
        color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font-code)', transition: 'var(--transition-fast)',
    },
    langActive: { background: 'var(--bg-elevated)', color: 'var(--accent-blue)' },
    mainGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '600px',
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
    genBtn: {
        padding: '6px 16px', border: 'none', borderRadius: '8px',
        background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))',
        color: '#1E1E2E', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
    },
    editorWrap: { flex: 1, minHeight: 0 },
    testPanel: {
        background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)',
        overflow: 'auto', display: 'flex', flexDirection: 'column',
    },
    loadingState: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flex: 1, padding: '60px 20px', color: 'var(--text-secondary)',
    },
    spinner: {
        width: '40px', height: '40px', border: '3px solid var(--border-color)',
        borderTopColor: 'var(--accent-green)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', marginBottom: '16px',
    },
    testHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
    },
    funcName: {
        margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)',
        fontFamily: 'var(--font-code)',
    },
    funcDesc: { margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' },
    runBtn: {
        padding: '8px 20px', border: 'none', borderRadius: '8px',
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
    },
    resultsBar: {
        padding: '12px 20px', background: 'var(--bg-primary)', display: 'flex',
        alignItems: 'center', gap: '16px',
    },
    resultsBadge: {
        display: 'flex', gap: '16px', fontSize: '13px', fontFamily: 'var(--font-code)',
    },
    resultProgress: {
        flex: 1, height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden',
    },
    resultProgressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
    testList: { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    testCard: {
        padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: '10px',
        borderLeft: '3px solid',
    },
    testCardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
    },
    testName: { fontSize: '13px', fontWeight: 600, color: 'var(--text-bright)' },
    testCategory: {
        padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
        textTransform: 'uppercase',
    },
    testIO: { display: 'flex', flexDirection: 'column', gap: '4px' },
    testIORow: { display: 'flex', alignItems: 'center', gap: '8px' },
    testIOLabel: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '60px' },
    testIOValue: {
        fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--accent-blue)',
        background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px',
    },
    testExplain: {
        margin: '8px 0 0', fontSize: '11px', color: 'var(--text-muted)',
        fontStyle: 'italic', lineHeight: 1.4,
    },
    runnerDetails: { padding: '12px 16px' },
    runnerSummary: {
        fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600,
        marginBottom: '8px',
    },
    runnerCode: {
        padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px',
        fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--text-secondary)',
        overflow: 'auto', maxHeight: '200px', whiteSpace: 'pre-wrap',
    },
    emptyState: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flex: 1, padding: '60px 20px', textAlign: 'center',
    },
};

export default TestLab;
