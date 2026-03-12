import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Canvas from '../components/Visualizer/Canvas';
import { motion as Motion } from 'framer-motion';
import API_BASE from '../utils/api';

// Pre-defined algorithm templates for the race
const RACE_TEMPLATES = {
    'Bubble Sort': `def sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
sort(arr)`,

    'Selection Sort': `def sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
sort(arr)`,

    'Insertion Sort': `def sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i-1
        while j >=0 and key < arr[j]:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
sort(arr)`,

    'Linear Search': `def search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

arr = [10, 20, 30, 40, 50, 60, 70, 80]
target = 60
search(arr, target)`,

    'Binary Search': `def search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

arr = [10, 20, 30, 40, 50, 60, 70, 80]
target = 60
search(arr, target)`
};

const AlgoRace = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    // Racer 1 State
    const [name1, setName1] = useState('Bubble Sort');
    const [code1, setCode1] = useState(RACE_TEMPLATES['Bubble Sort']);
    const [trace1, setTrace1] = useState([]);
    const [step1, setStep1] = useState(0);
    const [status1, setStatus1] = useState('ready'); // ready, loaded, error

    // Racer 2 State
    const [name2, setName2] = useState('Selection Sort');
    const [code2, setCode2] = useState(RACE_TEMPLATES['Selection Sort']);
    const [trace2, setTrace2] = useState([]);
    const [step2, setStep2] = useState(0);
    const [status2, setStatus2] = useState('ready');

    // Global Race State
    const [isRacing, setIsRacing] = useState(false);
    const [raceWinner, setRaceWinner] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [speed, setSpeed] = useState(300);

    const raceInterval = useRef(null);

    const handleLoadTemplates = (racer, algoName) => {
        if (racer === 1) {
            setName1(algoName);
            setCode1(RACE_TEMPLATES[algoName] || '');
        } else {
            setName2(algoName);
            setCode2(RACE_TEMPLATES[algoName] || '');
        }
        resetRace();
    };

    const resetRace = () => {
        clearInterval(raceInterval.current);
        setIsRacing(false);
        setRaceWinner(null);
        setStep1(0);
        setStep2(0);
        setTrace1([]);
        setTrace2([]);
        setStatus1('ready');
        setStatus2('ready');
    };

    const prepareRace = async () => {
        setIsLoading(true);
        resetRace();

        try {
            // Fetch traces in parallel
            const headers = { Authorization: 'Bearer ' + user?.token };
            const req1 = axios.post(`${API_BASE}/run`, { language: 'python', code: code1 }, { headers });
            const req2 = axios.post(`${API_BASE}/run`, { language: 'python', code: code2 }, { headers });

            const [res1, res2] = await Promise.all([req1, req2]);

            let t1 = res1.data.trace || [];
            let t2 = res2.data.trace || [];

            if (t1.length > 0) {
                setTrace1(t1);
                setStatus1('loaded');
            } else {
                setStatus1('error');
            }

            if (t2.length > 0) {
                setTrace2(t2);
                setStatus2('loaded');
            } else {
                setStatus2('error');
            }

            if (t1.length > 0 && t2.length > 0) {
                // Determine winner ahead of time based on steps
                if (t1.length < t2.length) setRaceWinner(1);
                else if (t2.length < t1.length) setRaceWinner(2);
                else setRaceWinner('tie');
            }
        } catch (error) {
            console.error(error);
            setStatus1('error');
            setStatus2('error');
        }
        setIsLoading(false);
    };

    const startRace = () => {
        if (trace1.length === 0 || trace2.length === 0) return;
        setIsRacing(true);
        setStep1(0);
        setStep2(0);

        clearInterval(raceInterval.current);

        raceInterval.current = setInterval(() => {
            let finished1 = false;
            let finished2 = false;

            setStep1(prev => {
                if (prev >= trace1.length - 1) { finished1 = true; return prev; }
                return prev + 1;
            });

            setStep2(prev => {
                if (prev >= trace2.length - 1) { finished2 = true; return prev; }
                return prev + 1;
            });

            // Check if both finished inside the interval callback using refs or just let it naturally stop
        }, speed);
    };

    // Auto-stop when both reach the end
    useEffect(() => {
        if (!isRacing) return;
        if (step1 >= Math.max(0, trace1.length - 1) && step2 >= Math.max(0, trace2.length - 1)) {
            clearInterval(raceInterval.current);
            setIsRacing(false);
        }
    }, [step1, step2, trace1.length, trace2.length, isRacing]);

    useEffect(() => {
        return () => clearInterval(raceInterval.current);
    }, []);

    // Helper for racer panel
    const renderRacerPanel = (num, name, code, setCode, trace, step, setStep, status) => {
        const isWinner = raceWinner === num;
        const isLoser = raceWinner !== null && raceWinner !== num && raceWinner !== 'tie';
        const finished = trace.length > 0 && step >= trace.length - 1;

        return (
            <div style={{ ...S.racerPanel, borderColor: isWinner && finished ? '#48bb78' : isLoser && finished ? '#f56565' : '#333' }}>
                <div style={S.racerHeader}>
                    <div style={S.racerTitleLabel}>Racer {num}</div>
                    <select
                        value={name}
                        onChange={(e) => handleLoadTemplates(num, e.target.value)}
                        style={S.algoSelect}
                        disabled={isRacing || isLoading}
                    >
                        <option value="Custom">Custom Python Code</option>
                        {Object.keys(RACE_TEMPLATES).map(algo => (
                            <option key={algo} value={algo}>{algo}</option>
                        ))}
                    </select>
                </div>

                <div style={S.editorContainer}>
                    <Editor
                        height="100%"
                        language="python"
                        theme="vs-dark"
                        value={code}
                        onChange={v => setCode(v || '')}
                        options={{ minimap: { enabled: false }, fontSize: 13, readOnly: isRacing || isLoading }}
                    />
                </div>

                <div style={S.statsBar}>
                    <span>Steps: {trace.length > 0 ? step + ' / ' + (trace.length - 1) : '0 / 0'}</span>
                    {status === 'loaded' && trace.length > 0 && <span style={{ color: '#48bb78' }}>✅ Ready</span>}
                    {status === 'error' && <span style={{ color: '#fc8181' }}>❌ Error</span>}
                    {finished && isWinner && <Motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: '#48bb78', fontWeight: 'bold' }}>🏆 WINNER!</Motion.span>}
                </div>

                <div style={S.canvasContainer}>
                    {trace.length > 0 ? (
                        <Canvas traceData={trace} stepIndex={step} setStepIndex={setStep} />
                    ) : (
                        <div style={S.emptyCanvas}>
                            {status === 'error' ? 'Execution failed. Check code.' : 'Waiting to prep race...'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={S.page}>
            {/* Header */}
            <header style={S.header}>
                <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                <div style={S.titleContainer}>
                    <h2 style={S.title}>🏎️ Algorithm Race</h2>
                    <p style={S.subtitle}>Compare two algorithms side-by-side to see which is more efficient.</p>
                </div>

                <div style={S.controls}>
                    <div style={S.speedControl}>
                        <span style={{ fontSize: '12px', color: '#888' }}>Speed:</span>
                        <select value={speed} onChange={e => setSpeed(Number(e.target.value))} style={S.select}>
                            <option value={800}>🐢 Slow</option>
                            <option value={300}>🚶 Normal</option>
                            <option value={100}>🐇 Fast</option>
                            <option value={30}>🚀 Turbo</option>
                        </select>
                    </div>

                    {(status1 !== 'loaded' || status2 !== 'loaded') ? (
                        <button onClick={prepareRace} disabled={isLoading} style={S.prepBtn}>
                            {isLoading ? '⏳ Compiling & Preparing...' : '⚙️ Prepare Race'}
                        </button>
                    ) : (
                        isRacing ? (
                            <button onClick={() => { clearInterval(raceInterval.current); setIsRacing(false); }} style={S.stopBtn}>
                                ⏹️ Pause Race
                            </button>
                        ) : (
                            <button onClick={step1 > 0 ? resetRace : startRace} style={step1 > 0 ? S.resetBtn : S.startBtn}>
                                {step1 > 0 ? '🔄 Reset Race' : '🏁 Start Race'}
                            </button>
                        )
                    )}
                </div>
            </header>

            {/* Split Track */}
            <div style={S.track}>
                {renderRacerPanel(1, name1, code1, setCode1, trace1, step1, setStep1, status1)}

                <div style={S.vsDivider}>VS</div>

                {renderRacerPanel(2, name2, code2, setCode2, trace2, step2, setStep2, status2)}
            </div>
        </div>
    );
};

const S = {
    page: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117', color: '#e4e4e7', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#161b22', borderBottom: '1px solid #30363d' },
    backBtn: { background: 'transparent', border: '1px solid #30363d', color: '#8b949e', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    titleContainer: { textAlign: 'center' },
    title: { margin: 0, fontSize: '24px', fontWeight: 800, color: '#c9d1d9' },
    subtitle: { margin: '4px 0 0', fontSize: '13px', color: '#8b949e' },

    controls: { display: 'flex', gap: '12px', alignItems: 'center' },
    speedControl: { display: 'flex', alignItems: 'center', gap: '8px', background: '#21262d', padding: '4px 12px', borderRadius: '6px' },
    select: { background: 'transparent', border: 'none', color: '#c9d1d9', outline: 'none', cursor: 'pointer' },

    prepBtn: { background: '#238636', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
    startBtn: { background: 'linear-gradient(135deg, #1f6feb, #3b82f6)', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', boxShadow: '0 0 15px rgba(59,130,246,0.3)' },
    stopBtn: { background: '#da3633', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
    resetBtn: { background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '8px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },

    track: { display: 'flex', flex: 1, overflow: 'hidden', padding: '16px', gap: '16px', position: 'relative' },
    vsDivider: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: '#161b22', color: '#ff7b72', padding: '12px 16px', borderRadius: '50%', border: '2px solid #30363d', fontWeight: 900, fontSize: '18px', zIndex: 10, fontStyle: 'italic' },

    racerPanel: { flex: 1, display: 'flex', flexDirection: 'column', background: '#161b22', borderRadius: '12px', border: '2px solid #30363d', overflow: 'hidden', transition: 'border-color 0.3s' },
    racerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#21262d', borderBottom: '1px solid #30363d' },
    racerTitleLabel: { fontWeight: 800, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' },
    algoSelect: { background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', outline: 'none' },

    editorContainer: { height: '180px', borderBottom: '1px solid #30363d' },
    statsBar: { display: 'flex', justifyContent: 'space-between', padding: '8px 16px', background: '#0d1117', borderBottom: '1px solid #30363d', fontSize: '13px', fontFamily: 'monospace', color: '#8b949e' },

    canvasContainer: { flex: 1, position: 'relative', overflow: 'hidden', background: '#0d1117' },
    emptyCanvas: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#8b949e', fontStyle: 'italic', fontSize: '14px' }
};

export default AlgoRace;
