import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import API_BASE from '../utils/api';
import AstFlowchart from '../components/Visualizer/AstFlowchart';
import TraceRibbon from '../components/Visualizer/TraceRibbon';

const API = `${API_BASE}/api/problems`;
const DIFF_COLORS = { easy: 'var(--accent-green)', medium: 'var(--accent-yellow)', hard: 'var(--accent-red)' };
const VERDICT_STYLES = {
    accepted: { color: 'var(--accent-green)', icon: '✅', label: 'Accepted' },
    wrong_answer: { color: 'var(--accent-red)', icon: '❌', label: 'Wrong Answer' },
    time_limit_exceeded: { color: 'var(--accent-yellow)', icon: '⏱️', label: 'Time Limit Exceeded' },
    runtime_error: { color: 'var(--accent-red)', icon: '💥', label: 'Runtime Error' },
    compilation_error: { color: 'var(--accent-red)', icon: '🔧', label: 'Compilation Error' },
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
    const workspaceRef = useRef(null);

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
        <div style={S.page} ref={workspaceRef}>
            <TraceRibbon containerRef={workspaceRef} />
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
                        {['description', 'submissions', 'ast'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}>
                                {t === 'description' ? '📝 Description' : t === 'submissions' ? '📊 Submissions' : '🧠 Architecture (AST)'}
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
                                        <div><strong style={{ color: 'var(--text-muted)' }}>Input:</strong> <code style={S.code}>{ex.input}</code></div>
                                        <div><strong style={{ color: 'var(--text-muted)' }}>Output:</strong> <code style={S.code}>{ex.output}</code></div>
                                        {ex.explanation && <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>💡 {ex.explanation}</div>}
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
                    ) : activeTab === 'submissions' ? (
                        <div style={S.descContent}>
                            {submissions.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No submissions yet</p>
                            ) : submissions.map((s, i) => {
                                const vs = VERDICT_STYLES[s.verdict] || {};
                                return (
                                    <div key={i} style={S.submissionRow}>
                                        <span style={{ color: vs.color, fontWeight: 'bold' }}>{vs.icon} {vs.label}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{s.language} • {s.passedTests}/{s.totalTests} passed</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{new Date(s.createdAt).toLocaleString()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : activeTab === 'ast' ? (
                        <div style={{...S.descContent, padding: 0}}>
                             {language === 'javascript' ? (
                                <AstFlowchart code={code} />
                             ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
                                    <h3>AST Flowchart Synthesis requires JavaScript</h3>
                                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Please switch language to JavaScript to view the Abstract Syntax Tree.</p>
                                </div>
                             )}
                        </div>
                    ) : null}
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
                                        <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {result.passedTests}/{result.totalTests} test cases passed
                                        </span>
                                    </div>

                                    {/* Test Case Results */}
                                    <div style={S.testResults}>
                                        {result.testResults?.map((tc, i) => (
                                            <div key={i} style={{ ...S.testCase, borderColor: tc.passed ? 'rgba(72,187,120,0.3)' : 'rgba(252,129,129,0.3)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: 'bold', color: tc.passed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                        {tc.passed ? '✅' : '❌'} Test {i + 1}
                                                    </span>
                                                </div>
                                                {!tc.passed && tc.input !== '[hidden]' && (
                                                    <div style={S.testDetail}>
                                                        <div><span style={{ color: 'var(--text-muted)' }}>Input:</span> <code>{tc.input}</code></div>
                                                        <div><span style={{ color: 'var(--text-muted)' }}>Expected:</span> <code style={{ color: 'var(--accent-green)' }}>{tc.expectedOutput}</code></div>
                                                        <div><span style={{ color: 'var(--text-muted)' }}>Got:</span> <code style={{ color: 'var(--accent-red)' }}>{tc.actualOutput}</code></div>
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
    page: { height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' },
    loading: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)' },

    topBar: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0
    },
    backBtn: { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
    problemTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' },
    diffBadge: { fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' },
    langSelect: {
        padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
        background: 'var(--bg-muted)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none'
    },

    main: { display: 'flex', flex: 1, overflow: 'hidden' },

    leftPanel: {
        width: '45%', display: 'flex', flexDirection: 'column', 
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRight: 'var(--glass-border)',
        overflow: 'auto'
    },
    tabs: { display: 'flex', gap: '4px', padding: '10px 16px', borderBottom: 'var(--glass-border)' },
    tab: { padding: '6px 14px', border: 'none', borderRadius: '0px', background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
    tabActive: { background: 'rgba(255,255,255,0.05)', color: 'var(--accent-cyan)', borderBottom: '2px solid var(--accent-cyan)' },
    descContent: { padding: '16px 20px', overflow: 'auto', flex: 1 },
    descText: { fontSize: '14px', lineHeight: 1.7, color: '#d1d5db', whiteSpace: 'pre-line', marginBottom: '16px' },

    exampleBox: { marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' },
    exampleHeader: { padding: '8px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-muted)' },
    exampleContent: { padding: '12px 14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' },
    code: { background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },

    section: { marginTop: '16px' },
    sectionTitle: { margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 },
    constraintList: { margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.8 },

    hintBtn: { background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', color: 'var(--accent-teal)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
    hintBox: { marginTop: '8px', padding: '10px 14px', background: 'rgba(13,148,136,0.08)', borderRadius: '8px', fontSize: '13px', color: '#a78bfa' },
    nextHintBtn: { marginTop: '8px', background: 'transparent', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', fontSize: '12px' },
    companyTag: { padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: 'var(--bg-muted)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' },

    submissionRow: {
        padding: '12px 0', borderBottom: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', gap: '4px'
    },

    rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-glass)', backdropFilter: 'var(--glass-blur)', borderLeft: 'var(--glass-border)' },
    editorWrap: { flex: 1, minHeight: 0, borderBottom: 'var(--glass-border)' },
    actionBar: { display: 'flex', gap: '8px', padding: '10px 16px', background: 'rgba(0,0,0,0.2)' },
    runBtn: {
        padding: '8px 20px', borderRadius: '0px', border: '1px solid var(--border-ghost)', cursor: 'pointer',
        background: 'transparent', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s'
    },
    submitBtn: {
        padding: '8px 20px', borderRadius: '0px', border: 'none', cursor: 'pointer',
        background: 'var(--accent-cyan)', color: 'var(--text-inverse)', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s'
    },

    resultPanel: { maxHeight: '250px', overflow: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' },
    resultHeader: { padding: '10px 16px', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid var(--border-color)' },
    resultOutput: { margin: 0, padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#d1d5db', whiteSpace: 'pre-wrap' },
    testResults: { padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    testCase: { padding: '10px 14px', borderRadius: '8px', border: '1px solid', background: 'var(--bg-muted)' },
    testDetail: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontFamily: 'monospace' },
};

export default ProblemSolve;
