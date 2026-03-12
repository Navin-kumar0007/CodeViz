import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import API_BASE from '../utils/api';

const API = `${API_BASE}/api/problems`;
const DIFF_COLORS = { easy: '#48bb78', medium: '#f6ad55', hard: '#fc8181' };
const VERDICT_STYLES = {
    accepted: { color: '#48bb78', icon: '✅', label: 'Accepted' },
    wrong_answer: { color: '#fc8181', icon: '❌', label: 'Wrong Answer' },
    time_limit_exceeded: { color: '#f6ad55', icon: '⏱️', label: 'Time Limit Exceeded' },
    runtime_error: { color: '#fc8181', icon: '💥', label: 'Runtime Error' },
    compilation_error: { color: '#fc8181', icon: '🔧', label: 'Compilation Error' },
};

const LANG_LABELS = {
    python: '🐍 Python', javascript: '⚡ JavaScript', java: '☕ Java', cpp: '⚙️ C++',
    typescript: '📘 TypeScript', go: '🔵 Go', c: '🔷 C'
};

const ProblemSolve = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const headers = { Authorization: `Bearer ${user?.token}` };

    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [showHints, setShowHints] = useState(false);
    const [hintIndex, setHintIndex] = useState(0);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        loadProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const loadProblem = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/${slug}`, { headers });
            setProblem(data);
            setCode(data.starterCode?.[language] || `# Write your solution for: ${data.title}\n`);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        if (problem?.starterCode?.[lang]) setCode(problem.starterCode[lang]);
    };

    // Run against example test cases only
    const handleRun = async () => {
        setRunning(true);
        setResult(null);
        try {
            const input = problem?.examples?.[0]?.input || '';
            const { data } = await axios.post(`${API_BASE}/run`, { language, code, input }, { headers });
            setResult({ type: 'run', output: data.output || data.error || 'No output', trace: data.trace });
        } catch {
            setResult({ type: 'run', output: 'Error running code' });
        }
        setRunning(false);
    };

    // Submit against all test cases
    const handleSubmit = async () => {
        setSubmitting(true);
        setResult(null);
        try {
            const { data } = await axios.post(`${API}/submit`, {
                problemId: problem._id, language, code
            }, { headers });
            setResult({ type: 'submit', ...data });
            loadSubmissions();
        } catch {
            setResult({ type: 'submit', verdict: 'runtime_error', testResults: [], totalTests: 0, passedTests: 0 });
        }
        setSubmitting(false);
    };

    const loadSubmissions = async () => {
        if (!problem?._id) return;
        try {
            const { data } = await axios.get(`${API}/submissions/${problem._id}`, { headers });
            setSubmissions(data);
        } catch { /* ignore */ }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (problem?._id) loadSubmissions(); }, [problem?._id]);

    const monacoLang = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language;

    if (loading) return <div style={S.page}><div style={S.loading}>Loading problem...</div></div>;
    if (!problem) return <div style={S.page}><div style={S.loading}>Problem not found</div></div>;

    return (
        <div style={S.page}>
            {/* Top Bar */}
            <div style={S.topBar}>
                <button onClick={() => navigate('/problems')} style={S.backBtn}>← Problems</button>
                <span style={S.problemTitle}>{problem.order}. {problem.title}</span>
                <span style={{ ...S.diffBadge, color: DIFF_COLORS[problem.difficulty] }}>
                    {problem.difficulty}
                </span>
                <div style={{ flex: 1 }} />
                <select value={language} onChange={e => handleLanguageChange(e.target.value)} style={S.langSelect}>
                    {Object.entries(LANG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>

            {/* Main Split */}
            <div style={S.main}>
                {/* Left: Problem Description */}
                <div style={S.leftPanel}>
                    <div style={S.tabs}>
                        {['description', 'submissions'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}>
                                {t === 'description' ? '📝 Description' : '📊 Submissions'}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'description' ? (
                        <div style={S.descContent}>
                            <div style={S.descText}>{problem.description}</div>

                            {/* Examples */}
                            {problem.examples?.map((ex, i) => (
                                <div key={i} style={S.exampleBox}>
                                    <div style={S.exampleHeader}>Example {i + 1}</div>
                                    <div style={S.exampleContent}>
                                        <div><strong style={{ color: '#888' }}>Input:</strong> <code style={S.code}>{ex.input}</code></div>
                                        <div><strong style={{ color: '#888' }}>Output:</strong> <code style={S.code}>{ex.output}</code></div>
                                        {ex.explanation && <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>💡 {ex.explanation}</div>}
                                    </div>
                                </div>
                            ))}

                            {/* Constraints */}
                            {problem.constraints?.length > 0 && (
                                <div style={S.section}>
                                    <h4 style={S.sectionTitle}>Constraints</h4>
                                    <ul style={S.constraintList}>
                                        {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Hints */}
                            {problem.hints?.length > 0 && (
                                <div style={S.section}>
                                    <button onClick={() => setShowHints(!showHints)} style={S.hintBtn}>
                                        {showHints ? '🙈 Hide Hints' : `💡 Show Hints (${problem.hints.length})`}
                                    </button>
                                    {showHints && problem.hints.slice(0, hintIndex + 1).map((h, i) => (
                                        <div key={i} style={S.hintBox}>Hint {i + 1}: {h}</div>
                                    ))}
                                    {showHints && hintIndex < problem.hints.length - 1 && (
                                        <button onClick={() => setHintIndex(i => i + 1)} style={S.nextHintBtn}>Next Hint →</button>
                                    )}
                                </div>
                            )}

                            {/* Company Tags */}
                            {problem.companyTags?.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px' }}>
                                    {problem.companyTags.map(t => (
                                        <span key={t} style={S.companyTag}>{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={S.descContent}>
                            {submissions.length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No submissions yet</p>
                            ) : submissions.map((s, i) => {
                                const vs = VERDICT_STYLES[s.verdict] || {};
                                return (
                                    <div key={i} style={S.submissionRow}>
                                        <span style={{ color: vs.color, fontWeight: 'bold' }}>{vs.icon} {vs.label}</span>
                                        <span style={{ color: '#888', fontSize: '11px' }}>{s.language} • {s.passedTests}/{s.totalTests} passed</span>
                                        <span style={{ color: '#666', fontSize: '10px' }}>{new Date(s.createdAt).toLocaleString()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Editor + Output */}
                <div style={S.rightPanel}>
                    {/* Editor */}
                    <div style={S.editorWrap}>
                        <Editor
                            height="100%"
                            language={monacoLang}
                            value={code}
                            onChange={v => setCode(v || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14, minimap: { enabled: false }, padding: { top: 12 },
                                scrollBeyondLastLine: false, wordWrap: 'on'
                            }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={S.actionBar}>
                        <button onClick={handleRun} disabled={running || submitting} style={S.runBtn}>
                            {running ? '⏳ Running...' : '▶ Run'}
                        </button>
                        <button onClick={handleSubmit} disabled={running || submitting} style={S.submitBtn}>
                            {submitting ? '⏳ Judging...' : '🚀 Submit'}
                        </button>
                    </div>

                    {/* Results */}
                    {result && (
                        <div style={S.resultPanel}>
                            {result.type === 'run' ? (
                                <div>
                                    <div style={S.resultHeader}>Output</div>
                                    <pre style={S.resultOutput}>{result.output}</pre>
                                </div>
                            ) : (
                                <div>
                                    <div style={{
                                        ...S.resultHeader,
                                        color: VERDICT_STYLES[result.verdict]?.color || '#888'
                                    }}>
                                        {VERDICT_STYLES[result.verdict]?.icon} {VERDICT_STYLES[result.verdict]?.label || result.verdict}
                                        <span style={{ marginLeft: '12px', fontSize: '12px', color: '#888' }}>
                                            {result.passedTests}/{result.totalTests} test cases passed
                                        </span>
                                    </div>

                                    {/* Test Case Results */}
                                    <div style={S.testResults}>
                                        {result.testResults?.map((tc, i) => (
                                            <div key={i} style={{ ...S.testCase, borderColor: tc.passed ? 'rgba(72,187,120,0.3)' : 'rgba(252,129,129,0.3)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: 'bold', color: tc.passed ? '#48bb78' : '#fc8181' }}>
                                                        {tc.passed ? '✅' : '❌'} Test {i + 1}
                                                    </span>
                                                </div>
                                                {!tc.passed && tc.input !== '[hidden]' && (
                                                    <div style={S.testDetail}>
                                                        <div><span style={{ color: '#888' }}>Input:</span> <code>{tc.input}</code></div>
                                                        <div><span style={{ color: '#888' }}>Expected:</span> <code style={{ color: '#48bb78' }}>{tc.expectedOutput}</code></div>
                                                        <div><span style={{ color: '#888' }}>Got:</span> <code style={{ color: '#fc8181' }}>{tc.actualOutput}</code></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary, #1a1a2e)', fontFamily: 'Inter, sans-serif', color: '#e4e4e7' },
    loading: { padding: '40px', textAlign: 'center', color: '#888' },

    topBar: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0
    },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#888', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
    problemTitle: { fontSize: '16px', fontWeight: 700, color: '#e4e4e7' },
    diffBadge: { fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' },
    langSelect: {
        padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.05)', color: '#e4e4e7', fontSize: '12px', outline: 'none'
    },

    main: { display: 'flex', flex: 1, overflow: 'hidden' },

    leftPanel: {
        width: '45%', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)',
        overflow: 'auto'
    },
    tabs: { display: 'flex', gap: '4px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tab: { padding: '6px 14px', border: 'none', borderRadius: '6px', background: 'transparent', color: '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
    tabActive: { background: 'rgba(255,255,255,0.08)', color: '#e4e4e7' },
    descContent: { padding: '16px 20px', overflow: 'auto', flex: 1 },
    descText: { fontSize: '14px', lineHeight: 1.7, color: '#d1d5db', whiteSpace: 'pre-line', marginBottom: '16px' },

    exampleBox: { marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' },
    exampleHeader: { padding: '8px 14px', fontSize: '12px', fontWeight: 700, color: '#888', background: 'rgba(255,255,255,0.03)' },
    exampleContent: { padding: '12px 14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' },
    code: { background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },

    section: { marginTop: '16px' },
    sectionTitle: { margin: '0 0 8px 0', fontSize: '13px', color: '#888', fontWeight: 700 },
    constraintList: { margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#888', lineHeight: 1.8 },

    hintBtn: { background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.3)', color: '#667eea', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    hintBox: { marginTop: '8px', padding: '10px 14px', background: 'rgba(102,126,234,0.08)', borderRadius: '8px', fontSize: '13px', color: '#a78bfa' },
    nextHintBtn: { marginTop: '8px', background: 'transparent', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '12px' },
    companyTag: { padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.08)' },

    submissionRow: {
        padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', gap: '4px'
    },

    rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    editorWrap: { flex: 1, minHeight: 0 },
    actionBar: { display: 'flex', gap: '8px', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' },
    runBtn: {
        padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        background: 'rgba(255,255,255,0.08)', color: '#e4e4e7', fontSize: '13px', fontWeight: 700
    },
    submitBtn: {
        padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #48bb78, #38a169)', color: '#fff', fontSize: '13px', fontWeight: 700
    },

    resultPanel: { maxHeight: '250px', overflow: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' },
    resultHeader: { padding: '10px 16px', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' },
    resultOutput: { margin: 0, padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#d1d5db', whiteSpace: 'pre-wrap' },
    testResults: { padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    testCase: { padding: '10px 14px', borderRadius: '8px', border: '1px solid', background: 'rgba(255,255,255,0.02)' },
    testDetail: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontFamily: 'monospace' },
};

export default ProblemSolve;
