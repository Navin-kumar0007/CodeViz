import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API as axios } from '../utils/api';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Rocket, CheckCircle2, XCircle, Clock, Lightbulb } from 'lucide-react';
import API_BASE from '../utils/api';
import AstFlowchart from '../components/Visualizer/AstFlowchart';
import { Button, Select, DifficultyBadge, Badge, Spinner, EmptyState } from '../components/ui';

const API = `${API_BASE}/api/problems`;
const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

const VERDICT = {
  accepted: { tone: 'success', Icon: CheckCircle2, label: 'Accepted' },
  wrong_answer: { tone: 'danger', Icon: XCircle, label: 'Wrong Answer' },
  time_limit_exceeded: { tone: 'warning', Icon: Clock, label: 'Time Limit Exceeded' },
  runtime_error: { tone: 'danger', Icon: XCircle, label: 'Runtime Error' },
  compilation_error: { tone: 'danger', Icon: XCircle, label: 'Compilation Error' },
};
const LANGS = { python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript', java: 'Java', c: 'C', cpp: 'C++', go: 'Go' };
const TABS = [{ id: 'description', label: 'Description' }, { id: 'submissions', label: 'Submissions' }, { id: 'ast', label: 'Architecture' }];

export default function ProblemSolve() {
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
  useEffect(() => {
    if (problem?._id) loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?._id]);

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

  const handleRun = async () => {
    setRunning(true); setResult(null);
    try {
      const input = problem?.examples?.[0]?.input || '';
      const { data } = await axios.post(`${API_BASE}/run`, { language, code, input }, { headers });
      setResult({ type: 'run', output: data.output || data.error || 'No output', trace: data.trace });
    } catch { setResult({ type: 'run', output: 'Error running code' }); }
    setRunning(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setResult(null);
    try {
      const { data } = await axios.post(`${API}/submit`, { problemId: problem._id, language, code }, { headers });
      setResult({ type: 'submit', ...data });
      loadSubmissions();
    } catch { setResult({ type: 'submit', verdict: 'runtime_error', testResults: [], totalTests: 0, passedTests: 0 }); }
    setSubmitting(false);
  };

  const loadSubmissions = async () => {
    if (!problem?._id) return;
    try { const { data } = await axios.get(`${API}/submissions/${problem._id}`, { headers }); setSubmissions(data); } catch { /* ignore */ }
  };

  const monacoLang = language === 'cpp' ? 'cpp' : language;

  if (loading) return <div className="h-full flex items-center justify-center gap-2 bg-bg text-muted" style={FONT}><Spinner /> Loading problem…</div>;
  if (!problem) return <div className="h-full flex items-center justify-center bg-bg text-muted" style={FONT}>Problem not found</div>;

  return (
    <div ref={workspaceRef} className="h-full flex flex-col bg-bg text-text overflow-hidden" style={FONT}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-line shrink-0 bg-surface">
        <Button variant="ghost" size="sm" onClick={() => navigate('/problems')}><ArrowLeft size={15} /> Problems</Button>
        <span className="text-[15px] font-bold text-text truncate">{problem.order}. {problem.title}</span>
        <DifficultyBadge level={problem.difficulty} />
        <div className="flex-1" />
        <div className="w-40">
          <Select value={language} onChange={(e) => handleLanguageChange(e.target.value)} size="sm">
            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
      </div>

      {/* Split */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
        {/* Left: problem */}
        <div className="flex flex-col min-h-0 border-r border-line">
          <div className="flex items-center gap-1 px-2 border-b border-line shrink-0 bg-surface">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 h-10 text-[12px] font-semibold uppercase tracking-wide border-b-2 -mb-px transition-colors cursor-pointer ${activeTab === t.id ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-text'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-5">
            {activeTab === 'description' && (
              <div className="flex flex-col gap-5">
                <p className="text-[14px] leading-relaxed text-text whitespace-pre-wrap m-0">{problem.description}</p>

                {problem.examples?.map((ex, i) => (
                  <div key={i} className="bg-surface border border-line rounded-lg p-3">
                    <div className="text-[12px] font-bold text-muted mb-2">Example {i + 1}</div>
                    <div className="flex flex-col gap-1 font-mono text-[13px]">
                      <div><span className="text-muted">Input:</span> <code className="text-text">{ex.input}</code></div>
                      <div><span className="text-muted">Output:</span> <code className="text-text">{ex.output}</code></div>
                      {ex.explanation && <div className="text-muted text-[12px] mt-1">{ex.explanation}</div>}
                    </div>
                  </div>
                ))}

                {problem.constraints?.length > 0 && (
                  <div>
                    <h4 className="text-[13px] font-bold m-0 mb-2">Constraints</h4>
                    <ul className="m-0 pl-5 text-[13px] text-muted flex flex-col gap-1">
                      {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {problem.hints?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" size="sm" className="self-start" onClick={() => setShowHints(!showHints)}>
                      <Lightbulb size={14} /> {showHints ? 'Hide hints' : `Show hints (${problem.hints.length})`}
                    </Button>
                    {showHints && problem.hints.slice(0, hintIndex + 1).map((h, i) => (
                      <div key={i} className="text-[13px] text-text bg-warning/10 border border-warning/25 rounded-lg px-3 py-2">Hint {i + 1}: {h}</div>
                    ))}
                    {showHints && hintIndex < problem.hints.length - 1 && (
                      <Button variant="ghost" size="sm" className="self-start" onClick={() => setHintIndex((i) => i + 1)}>Next hint →</Button>
                    )}
                  </div>
                )}

                {problem.companyTags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {problem.companyTags.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              submissions.length === 0
                ? <EmptyState icon="📊" title="No submissions yet" hint="Run and submit your solution to see history." />
                : <div className="flex flex-col gap-2">
                    {submissions.map((s, i) => {
                      const v = VERDICT[s.verdict] || VERDICT.runtime_error;
                      return (
                        <div key={i} className="flex items-center justify-between gap-3 bg-surface border border-line rounded-lg px-3 py-2.5">
                          <Badge tone={v.tone}><v.Icon size={13} /> {v.label}</Badge>
                          <span className="text-[11px] text-muted">{s.language} · {s.passedTests}/{s.totalTests}</span>
                          <span className="text-[11px] text-faint">{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                  </div>
            )}

            {activeTab === 'ast' && (
              language === 'javascript'
                ? <AstFlowchart code={code} />
                : <EmptyState icon="🧠" title="JavaScript required" hint="Switch language to JavaScript to view the Abstract Syntax Tree." />
            )}
          </div>
        </div>

        {/* Right: editor + results */}
        <div className="flex flex-col min-h-0">
          <div className="flex-1 min-h-0 border-b border-line">
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="light"
              options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 12 }, scrollBeyondLastLine: false, wordWrap: 'on' }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 px-4 h-12 shrink-0 bg-surface border-b border-line">
            <Button variant="secondary" onClick={handleRun} disabled={running || submitting}>
              {running ? <><Spinner size={14} /> Running…</> : <><Play size={15} /> Run</>}
            </Button>
            <Button onClick={handleSubmit} disabled={running || submitting}>
              {submitting ? <><Spinner size={14} /> Judging…</> : <><Rocket size={15} /> Submit</>}
            </Button>
          </div>

          {result && (
            <div className="shrink-0 max-h-[40%] overflow-auto p-4 bg-bg">
              {result.type === 'run' ? (
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wide text-muted mb-2">Output</div>
                  <pre className="text-[13px] font-mono text-text bg-surface border border-line rounded-lg p-3 whitespace-pre-wrap overflow-auto m-0">{result.output}</pre>
                </div>
              ) : (
                <div>
                  {(() => { const v = VERDICT[result.verdict] || VERDICT.runtime_error; return (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge tone={v.tone}><v.Icon size={13} /> {v.label}</Badge>
                      <span className="text-[12px] text-muted">{result.passedTests}/{result.totalTests} test cases passed</span>
                    </div>
                  ); })()}
                  <div className="flex flex-col gap-2">
                    {result.testResults?.map((tc, i) => (
                      <div key={i} className={`rounded-lg border px-3 py-2.5 ${tc.passed ? 'border-success/30 bg-success/5' : 'border-hard/30 bg-hard/5'}`}>
                        <span className={`flex items-center gap-1.5 text-[13px] font-bold ${tc.passed ? 'text-success' : 'text-hard'}`}>
                          {tc.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />} Test {i + 1}
                        </span>
                        {!tc.passed && tc.input !== '[hidden]' && (
                          <div className="mt-2 font-mono text-[12px] flex flex-col gap-1">
                            <div><span className="text-muted">Input:</span> <code>{tc.input}</code></div>
                            <div><span className="text-muted">Expected:</span> <code className="text-success">{tc.expectedOutput}</code></div>
                            <div><span className="text-muted">Got:</span> <code className="text-hard">{tc.actualOutput}</code></div>
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
}
