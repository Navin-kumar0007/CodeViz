import React, { useState, useEffect, useRef } from "react";
import { API as axios } from '../utils/api';
import { useNavigate } from "react-router-dom";
import CodeEditor from "../components/Editor/CodeEditor";
import Canvas from "../components/Visualizer/Canvas";
import AIAssistant from "../components/AI/AIAssistant";
import InlineErrorHint from "../components/AI/InlineErrorHint";
import SocraticTutor from "../components/AI/SocraticTutor"; // 🔥 New Socratic Tutor

// 👇 IMPORT FROM YOUR EXAMPLES FILE
import { EXAMPLES } from "../examples";

import { useTheme } from "../contexts/ThemeContext";
import ShareModal from "../components/Social/ShareModal";
import CodeSnapshot from "../components/Social/CodeSnapshot";
import ComplexityAnalyzer from "../components/Visualizer/ComplexityAnalyzer";
import SessionRecorder from "../components/Session/SessionRecorder";
import Terminal from "../components/Terminal/Terminal";
import API_BASE from '../utils/api';
import { unpackTrace } from '../utils/binaryTrace'; // ⚡ Binary Performance

// 📋 CODE TEMPLATES LIBRARY
const CODE_TEMPLATES = {
  python: {
    'Binary Search': 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nprint(binary_search([1,3,5,7,9], 5))',
    'Merge Sort': 'def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n\nprint(merge_sort([38, 27, 43, 3, 9, 82, 10]))',
    'BFS Graph': 'from collections import deque\n\ndef bfs(graph, start):\n    visited = set()\n    queue = deque([start])\n    visited.add(start)\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return order\n\ngraph = {0: [1,2], 1: [0,3], 2: [0,3], 3: [1,2]}\nprint(bfs(graph, 0))',
    'Linked List': 'class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\ndef build_list(values):\n    head = Node(values[0])\n    curr = head\n    for v in values[1:]:\n        curr.next = Node(v)\n        curr = curr.next\n    return head\n\ndef print_list(head):\n    vals = []\n    while head:\n        vals.append(str(head.val))\n        head = head.next\n    print(" -> ".join(vals))\n\nhead = build_list([1, 2, 3, 4, 5])\nprint_list(head)',
    'Stack Implementation': 'class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, val):\n        self.items.append(val)\n\n    def pop(self):\n        if self.is_empty():\n            return None\n        return self.items.pop()\n\n    def peek(self):\n        return self.items[-1] if self.items else None\n\n    def is_empty(self):\n        return len(self.items) == 0\n\ns = Stack()\nfor x in [10, 20, 30]:\n    s.push(x)\nprint("Top:", s.peek())\nprint("Pop:", s.pop())\nprint("Pop:", s.pop())',
  },
  systems: {
    'Child Process IPC': '// Parent process\nconst { fork } = require("child_process");\nconsole.log("Spawning child...");\n// Simulated IPC for visualizer\nconsole.log("Parent: Sending task to child");\nconsole.log("Child: Factorial of 5 is 120");',
    'Stream Transformation': 'const { Transform } = require("stream");\nconst upper = new Transform({\n  transform(chunk, enc, cb) {\n    this.push(chunk.toString().toUpperCase());\n    cb();\n  }\n});\nconsole.log("Original: test");\nconsole.log("Transformed: TEST");',
  },
  javascript: {
    'Binary Search': 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\nconsole.log(binarySearch([1,3,5,7,9], 5));',
    'Quick Sort': 'function quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[arr.length - 1];\n  const left = arr.filter((x, i) => i < arr.length - 1 && x <= pivot);\n  const right = arr.filter((x, i) => i < arr.length - 1 && x > pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}\nconsole.log(quickSort([38, 27, 43, 3, 9, 82, 10]));',
    'DFS Traversal': 'function dfs(graph, start) {\n  const visited = new Set();\n  const order = [];\n  function visit(node) {\n    if (visited.has(node)) return;\n    visited.add(node);\n    order.push(node);\n    for (const neighbor of graph[node]) visit(neighbor);\n  }\n  visit(start);\n  return order;\n}\nconst graph = {0:[1,2], 1:[0,3], 2:[0,3], 3:[1,2]};\nconsole.log(dfs(graph, 0));',
  },
  cpp: {
    'Hello World': '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    'Fibonacci': '#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++)\n        cout << fibonacci(i) << " ";\n    cout << endl;\n    return 0;\n}',
  },
  java: {
    'Hello World': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    'Factorial': 'public class Main {\n    static long factorial(int n) {\n        if (n <= 1) return 1;\n        return n * factorial(n - 1);\n    }\n\n    public static void main(String[] args) {\n        for (int i = 1; i <= 10; i++) {\n            System.out.println(i + "! = " + factorial(i));\n        }\n    }\n}',
  }
};

const Practice = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const { theme, toggleTheme } = useTheme();

  // Default Language
  const defaultLang = "python";

  // State
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('codeviz_autosave');
    if (saved) {
      try { return JSON.parse(saved).language || defaultLang; } catch { /* fall through */ }
    }
    return defaultLang;
  });

  // Initialize Code safely — restore from auto-save if available
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem('codeviz_autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.code) return parsed.code;
      } catch { /* fall through */ }
    }
    if (EXAMPLES && EXAMPLES[defaultLang]) {
      const firstAlgo = Object.keys(EXAMPLES[defaultLang])[0];
      return EXAMPLES[defaultLang][firstAlgo];
    }
    return "";
  });

  // 🛡️ STATE INITIALIZATION: Always start as an empty array []
  const [traceData, setTraceData] = useState([]);
  const [heatmapData, setHeatmapData] = useState({}); // 🔥 New Heatmap State
  const [output, setOutput] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("visualizer");

  const [snippets, setSnippets] = useState([]);

  const [showSnippetList, setShowSnippetList] = useState(false);
  const [sharingSnippet, setSharingSnippet] = useState(null); // Snippet being shared
  const [showSnapshot, setShowSnapshot] = useState(false); // Code snapshot modal
  const [showComplexity, setShowComplexity] = useState(false); // Complexity analyzer
  const [showNarrator, setShowNarrator] = useState(false); // AI Code Narrator
  const [showTutor, setShowTutor] = useState(false); // 🔥 Socratic Tutor Visibility
  const [aiHighlightLine, setAiHighlightLine] = useState(null); // 🤖 Jarvis Protocol Highlights
  const [narratorData, setNarratorData] = useState(null);
  const [isNarrating, setIsNarrating] = useState(false);

  // 🕵️ AI AUTHORSHIP DETECTION STATES
  const [showDetective, setShowDetective] = useState(false);
  const [detectionData, setDetectionData] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const [executionHistory, setExecutionHistory] = useState([]); // 📜 Execution history
  const [showTemplates, setShowTemplates] = useState(false); // 📋 Templates dropdown
  const [showHistory, setShowHistory] = useState(false); // 📜 History dropdown
  const [isMaximized, setIsMaximized] = useState(false); // 📺 Maximize Visualizer Mode

  // 1. Existing Handlers...
  // 📏 RESIZABLE SPLIT PANE STATE
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 📱 DETECT MOBILE
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ⚡ PERFORMANCE: Loading state and RAF for smooth resize
  const [isExecuting, setIsExecuting] = useState(false);
  const rafRef = useRef(null);

  // 💾 AUTO-SAVE: Save code + language to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('codeviz_autosave', JSON.stringify({
        code, language, timestamp: Date.now()
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, [code, language]);

  // 💾 Also save on unmount
  useEffect(() => {
    return () => {
      localStorage.setItem('codeviz_autosave', JSON.stringify({
        code, language, timestamp: Date.now()
      }));
      // Track last activity for Dashboard continue widget
      localStorage.setItem('codeviz_last_activity', JSON.stringify({
        type: 'practice', language, codePreview: code.slice(0, 100),
        timestamp: Date.now()
      }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 SMART LANGUAGE SWITCHER
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    if (EXAMPLES[newLang] && Object.keys(EXAMPLES[newLang]).length > 0) {
      const firstExampleKey = Object.keys(EXAMPLES[newLang])[0];
      setCode(EXAMPLES[newLang][firstExampleKey]);
    } else {
      setCode(`// No examples found for ${newLang}`);
    }

    setTraceData([]);
    setOutput("");
    setError(null);
  };

  // 🔄 ALGORITHM SELECTOR
  const handleAlgoChange = (e) => {
    const algoName = e.target.value;
    if (EXAMPLES[language] && EXAMPLES[language][algoName]) {
      setCode(EXAMPLES[language][algoName]);
    }
  };

  // 🏃 RUN CODE
  const runCode = async () => {
    setIsExecuting(true); // Show loading indicator
    setIsLoading(true);
    setError(null);
    setTraceData([]); // Reset to empty array
    setHeatmapData({}); // 🔥 Reset Heatmap
    setOutput("");
    setStepIndex(0);

    // 🐍 CLIENT-SIDE EXECUTION (Phase 8.1)
    if (language === 'python') {
      const { runPythonLocally } = await import('../utils/pyodideExecutor');
      const localResult = await runPythonLocally(code);

      if (localResult.success) {
        setOutput(localResult.output);
        setActiveTab("console");
      } else {
        setError(localResult.output);
        setIsLoading(false);
        setIsExecuting(false);
        return;
      }
    }

    // ⚡️ CLIENT-SIDE EXECUTION (JavaScript)
    else if (language === 'javascript') {
      // Capture console.log
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        originalLog.apply(console, args); // Keep browser console working
      };

      try {
        // Run code safely
        new Function(code)();
        setOutput(logs.join('\n'));
        setActiveTab("console");
      } catch (err) {
        setError(err.toString());
        setIsLoading(false);
        setIsExecuting(false);
        console.log = originalLog; // Restore
        return;
      }
      console.log = originalLog; // Restore
      // ✨ DO NOT return early here so the server can generate the Visualizer AST Trace!
    }

    // 📡 SERVER-SIDE VISUALIZATION (Needed for Visualizer Trace / AST)
    try {
      const stored = JSON.parse(localStorage.getItem('userInfo'));
      const res = await axios.post(`${API_BASE}/run?binary=true`, { language, code }, {
        headers: { Authorization: `Bearer ${stored?.token}` },
        responseType: 'arraybuffer' // ⚡ Request binary data
      });

      // Check if response is binary or JSON
      const contentType = res.headers['content-type'];
      
      if (contentType === 'application/octet-stream') {
        const safeTrace = unpackTrace(res.data);
        const heatmapHeader = res.headers['x-heatmap'];
        const heatmap = heatmapHeader ? JSON.parse(heatmapHeader) : {};
        
        setTraceData(safeTrace);
        setHeatmapData(heatmap);
        
        // Only overwrite output if it's not JS, or if we actually got execution output from the server
        const serverOutput = safeTrace.map(t => t.stdout || '').join('');
        if (language !== 'javascript' || serverOutput.trim().length > 0) {
           setOutput(serverOutput);
        }
        
        if (safeTrace.length > 0) setActiveTab("visualizer");
        else setActiveTab("console");
      } else {
        // Fallback for JSON
        const jsonData = JSON.parse(new TextDecoder().decode(res.data));
        if (jsonData.error) {
          setError(jsonData.error);
          setActiveTab("console");
        } else {
          setTraceData(jsonData.trace || []);
          setHeatmapData(jsonData.heatmap || {});
          
          if (language !== 'javascript' || (jsonData.output && jsonData.output.trim().length > 0)) {
            setOutput(jsonData.output || "");
          }
          if ((jsonData.trace || []).length > 0) setActiveTab("visualizer");
          else setActiveTab("console");
        }
      }

    } catch (err) {
      console.error(err);
      // For JS, local execution already succeeded. If the visualizer backend fails, just quietly ignore it.
      if (language !== 'javascript') {
          setError('Server error. Is the backend running?');
      }
    } finally {
      setIsLoading(false);
      setIsExecuting(false); // Clear loading indicator

      // 📜 Add to execution history (max 10)
      setExecutionHistory(prev => [
        { id: Date.now(), language, codePreview: code.slice(0, 80), output: output || error || 'No output', timestamp: new Date().toLocaleTimeString(), success: !error },
        ...prev.slice(0, 9)
      ]);
    }
  };

  // 💾 SAVE CODE
  const handleSave = async () => {
    if (!user) return alert("Please login to save code!");
    const title = prompt("Name this snippet:");
    if (!title) return;

    try {
      await axios.post(`${API_BASE}/api/snippets`, {
        userId: user._id, title, code, language
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("✅ Saved successfully!");
      fetchSnippets();
    } catch (err) {
      alert("❌ Save failed: " + err.message);
    }
  };

  // 🎙️ FETCH AI NARRATION
  const fetchNarration = async () => {
    if (!code) return alert("Write some code first!");
    setIsNarrating(true);
    setShowNarrator(true);
    try {
      const stored = JSON.parse(localStorage.getItem('userInfo'));
      const res = await axios.post(`${API_BASE}/api/ai/narrate`, {
        code, language, skillLevel: "beginner"
      }, { headers: { Authorization: `Bearer ${stored?.token}` } });
      setNarratorData(res.data.narrationData);
    } catch (e) {
      alert("Error: " + (e.response?.data?.message || e.message));
      setShowNarrator(false);
    } finally {
      setIsNarrating(false);
    }
  };

  // 🕵️ FETCH AI AUTHORSHIP DETECTION (NEW FOR PROFESSOR)
  const verifyAuthorship = async () => {
    if (!code || code.length < 10) return alert("Please write a larger block of code to analyze!");
    setIsDetecting(true);
    setShowDetective(true);
    try {
      const stored = JSON.parse(localStorage.getItem('userInfo'));
      const res = await axios.post(`${API_BASE}/api/ai/detect`, {
        code, language
      }, { headers: { Authorization: `Bearer ${stored?.token}` } });
      setDetectionData(res.data.detection);
    } catch (e) {
      alert("Error: " + (e.response?.data?.message || e.message));
      setShowDetective(false);
    } finally {
      setIsDetecting(false);
    }
  };

  // 🎥 SAVE RECORDED SESSION
  const handleSaveSession = async (sessionData) => {
    if (!user) return alert("Please login to save sessions!");

    const defaultTitle = language.toUpperCase() + " Practice Session";
    const title = prompt("Name this recorded session:", defaultTitle);

    if (!title) return; // User cancelled

    try {
      const payload = {
        title,
        description: "Recorded on " + new Date().toLocaleString(),
        language,
        events: sessionData.events,
        duration: sessionData.duration,
        metadata: sessionData.metadata,
        isPublic: false
      };

      await axios.post(`${API_BASE}/api/sessions`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("✅ Session saved successfully! You can view it in the Sessions tab.");
    } catch (err) {
      alert("❌ Failed to save session: " + err.message);
    }
  };

  // 🌍 SHARE CODE
  const handleShareClick = (snippet) => {
    setSharingSnippet(snippet);
  };

  const confirmShare = async () => {
    if (!sharingSnippet) return;
    try {
      await axios.put(`${API_BASE}/api/snippets/${sharingSnippet._id}/share`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert(`✅ Copied to clipboard: http://localhost:5173/snippet/${sharingSnippet._id} (Mock URL)`);
      setSharingSnippet(null);
      fetchSnippets();
    } catch (err) {
      alert("❌ Share failed: " + err.message);
    }
  };

  // 📂 LOAD SNIPPETS
  const fetchSnippets = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/api/snippets/${user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // 🛡️ SAFETY CHECK: Ensure it's an array
      setSnippets(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user) fetchSnippets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📏 RESIZABLE DIVIDER HANDLERS
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update for next frame (60fps max)
    rafRef.current = requestAnimationFrame(() => {
      const container = e.currentTarget;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setEditorWidth(newWidth);
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse up listener globally
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#08080C', color: '#E8E8ED', overflow: 'hidden' }}>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 24px', background: 'rgba(17,17,22,0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #00E5EE, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CODE_VIZ <span style={{ fontSize: '12px', color: '#5A5A6A', fontWeight: 400, fontFamily: "'JetBrains Mono', monospace", WebkitTextFillColor: '#5A5A6A' }}>{`// WORKSPACE`}</span></h2>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9898A6', cursor: 'pointer' }}>[ ESC ] Dashboard</button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>

          {/* 🕵️ THE NEW AI DETECTIVE TOOL */}
          <button onClick={showDetective ? () => setShowDetective(false) : verifyAuthorship} className="btn-secondary">🕵️‍♀️ {isDetecting ? 'Scanning...' : showDetective ? 'Hide Analysis' : 'Detect AI Code'}</button>

          <button onClick={() => setShowSnippetList(!showSnippetList)} className="btn-secondary">📂 My Snippets</button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(17,17,22,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E8E8ED',
              padding: '8px 14px',
              borderRadius: '100px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)'
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Snippet Dropdown */}
          {showSnippetList && (
            <div className="glass-card" style={{ position: 'absolute', top: '50px', right: '120px', padding: '10px', zIndex: 100, width: '280px', maxHeight: '300px', overflowY: 'auto' }}>
              {snippets.length === 0 && <div style={{ padding: '5px', color: 'var(--text-muted)', fontSize: '12px' }}>No saved codes yet.</div>}
              {snippets.map(s => (
                <div key={s._id} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div onClick={() => { setCode(s.code); setLanguage(s.language); setShowSnippetList(false) }} style={{ cursor: 'pointer', flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{s.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.language} • {s.isShared ? '🌍 Shared' : '🔒 Private'}</div>
                  </div>
                  {!s.isShared && (
                    <button onClick={() => handleShareClick(s)} style={{ background: 'transparent', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', fontSize: '10px', padding: '2px 6px', borderRadius: '8px', cursor: 'pointer' }}>share</button>
                  )}
                  {s.isShared && (
                    <span style={{ fontSize: '10px', color: 'var(--accent-green)' }}>active</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setShowTutor(!showTutor)} className="btn-secondary" style={{ borderColor: showTutor ? 'var(--accent-purple)' : 'var(--border-color)', color: showTutor ? 'var(--accent-purple)' : 'var(--text-primary)' }}>🤖 {showTutor ? 'Hide Tutor' : 'AI Tutor'}</button>
          <button onClick={showNarrator ? () => setShowNarrator(false) : fetchNarration} className="btn-secondary" style={{ borderColor: showNarrator ? 'var(--accent-yellow)' : 'var(--border-color)', color: showNarrator ? 'var(--accent-yellow)' : 'var(--text-primary)' }}>🎙️ {isNarrating ? 'Thinking...' : showNarrator ? 'Hide Narrator' : 'AI Narrator'}</button>
          <button onClick={() => setShowSnapshot(true)} className="btn-secondary">📸 Snapshot</button>
          <button onClick={() => setShowComplexity(!showComplexity)} className="btn-secondary" style={{ borderColor: showComplexity ? 'var(--accent-purple)' : 'var(--border-color)', color: showComplexity ? 'var(--accent-purple)' : 'var(--text-primary)' }}>📊 {showComplexity ? 'Hide Complexity' : 'Complexity'}</button>
          <button onClick={handleSave} className="btn-primary">💾 Save Code</button>
        </div>
      </header>

      {/* Share Modal */}
      <ShareModal
        isOpen={!!sharingSnippet}
        onClose={() => setSharingSnippet(null)}
        onShare={confirmShare}
        snippetTitle={sharingSnippet?.title}
      />

      {/* Code Snapshot Modal */}
      <CodeSnapshot
        isOpen={showSnapshot}
        onClose={() => setShowSnapshot(false)}
        code={code}
        language={language}
        userName={user?.name}
      />

      {/* TOOLBAR */}
      <div style={{ padding: '8px 24px', background: 'rgba(17,17,22,0.4)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '15px', alignItems: 'center' }}>

        {/* RUN BUTTON */}
        <button onClick={runCode} disabled={isLoading || isExecuting} style={{ padding: '8px 22px', background: 'linear-gradient(135deg, #00E5EE, #7C3AED)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: isLoading || isExecuting ? 'default' : 'pointer', boxShadow: '0 4px 20px rgba(0,229,238,0.2)', opacity: isLoading || isExecuting ? 0.6 : 1 }}>{isLoading ? '⏳ Running...' : '▶ RUN CODE'}
        </button>

        <select value={language} onChange={handleLanguageChange}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="typescript">TypeScript</option>
          <option value="go">Go</option>
          <option value="c">C</option>
        </select>

        <select onChange={handleAlgoChange} style={{ minWidth: '200px' }}>
          <option value="">Select an Example...</option>
          {EXAMPLES[language] ? (
            Object.keys(EXAMPLES[language]).map(algo => (
              <option key={algo} value={algo}>{algo}</option>
            ))
          ) : (
            <option disabled>No examples available</option>
          )}
        </select>

        {/* 📋 TEMPLATES DROPDOWN */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowTemplates(!showTemplates)} className="btn-secondary">
            📋 Templates
          </button>
          {showTemplates && (
            <div className="glass-card" style={{ position: 'absolute', top: '40px', left: 0, width: '240px', maxHeight: '300px', overflowY: 'auto', zIndex: 100 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Templates — {language}</div>
              {CODE_TEMPLATES[language] ? Object.entries(CODE_TEMPLATES[language]).map(([name, tmplCode]) => (
                <div key={name} onClick={() => { setCode(tmplCode); setShowTemplates(false); }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >{name}</div>
              )) : <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '12px' }}>No templates for {language}</div>}
            </div>
          )}
        </div>

        {/* 📜 EXECUTION HISTORY */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowHistory(!showHistory)} className="btn-secondary">
            📜 History {executionHistory.length > 0 && `(${executionHistory.length})`}
          </button>
          {showHistory && (
            <div className="glass-card" style={{ position: 'absolute', top: '40px', left: 0, width: '320px', maxHeight: '350px', overflowY: 'auto', zIndex: 100 }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Execution History</div>
              {executionHistory.length === 0 ? (
                <div style={{ padding: '15px 14px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No runs yet. Hit ▶ Run Code!</div>
              ) : executionHistory.map(h => (
                <div key={h.id} onClick={() => { setCode(h.codePreview.length < 80 ? h.codePreview : code); setShowHistory(false); }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '12px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: h.success ? 'var(--accent-green)' : 'var(--accent-red)' }}>{h.success ? '✅' : '❌'} {h.language}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{h.timestamp}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.codePreview}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '0px',
          minHeight: 0,
          background: '#08080C',
        }}
      >
        {/* LEFT: EDITOR PANE */}
        <div style={{
          width: isMaximized ? '0%' : (isMobile ? '100%' : `${editorWidth}%`),
          height: isMaximized ? '0%' : (isMobile ? '50%' : '100%'),
          display: isMaximized ? 'none' : 'flex',
          flexDirection: 'column',
          background: '#0A0A10', // Deep OLED nesting
          borderRight: (isMobile || isMaximized) ? 'none' : '1px solid var(--border-ghost)',
          borderBottom: isMobile ? '1px solid var(--border-ghost)' : 'none',
          position: 'relative',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>

          {/* 🎙️ AI NARRATOR FLOATING PANEL */}
          {showNarrator && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '320px', maxHeight: '80%', background: 'rgba(17,17,22,0.9)', border: '1px solid rgba(202,138,4,0.3)', borderRadius: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(202,138,4,0.15)', color: '#FBBF24', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(202,138,4,0.2)' }}>
                <span>🎙️ AI Code Narrator</span>
                <button onClick={() => setShowNarrator(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ padding: '15px', overflowY: 'auto', flex: 1, fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                {isNarrating ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', fontStyle: 'italic', color: '#aaa' }}>
                    Generating narrative... ⏳
                  </div>
                ) : narratorData ? (
                  <div>
                    <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                      <strong style={{ color: '#fbbf24' }}>Summary:</strong> {narratorData.summary}
                    </div>
                    {narratorData.narration && narratorData.narration.map((n, i) => (
                      <div key={i} style={{ marginBottom: '12px', padding: '8px', background: 'var(--bg-muted)', borderRadius: '6px', borderLeft: '3px solid #fbbf24' }}>
                        <span style={{ fontWeight: 'bold', color: '#60a5fa', marginRight: '6px' }}>{n.line ? `Line ${n.line}:` : n.block ? `${n.block}:` : 'Note:'}</span>
                        <span>{n.explanation}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--accent-red)' }}>Failed to load narration.</div>
                )}
              </div>
            </div>
          )}

          {/* 🕵️ AI DETECTIVE FLOATING PANEL */}
          {showDetective && (
            <div style={{ position: 'absolute', top: '10px', right: showNarrator ? '340px' : '10px', width: '350px', maxHeight: '90%', background: 'rgba(17,17,22,0.9)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', zIndex: 11, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.12)', color: '#F87171', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🕵️‍♀️ AI Authorship Analysis
                </span>
                <button onClick={() => setShowDetective(false)} style={{ background: 'transparent', border: 'none', color: '#ffb3b3', cursor: 'pointer', fontSize: '16px', lineHeight: '1' }}>✕</button>
              </div>
              <div style={{ padding: '15px', overflowY: 'auto', flex: 1, fontSize: '13px', lineHeight: '1.6', color: '#f8fafc' }}>
                {isDetecting ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ color: '#94a3b8', fontStyle: 'italic', animation: 'pulse 2s infinite' }}>Analyzing code signatures...</div>
                  </div>
                ) : detectionData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {/* Probability Score Header */}
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '15px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '5px' }}>Probability of AI Generation</div>
                      <div style={{ fontSize: '36px', fontWeight: '900', color: detectionData.aiProbability > 70 ? '#ef4444' : detectionData.aiProbability > 40 ? '#f59e0b' : '#22c55e',  }}>
                        {detectionData.aiProbability}%
                      </div>
                      <div style={{ marginTop: '5px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Verdict: <span style={{ color: detectionData.aiProbability > 70 ? '#ef4444' : detectionData.aiProbability > 40 ? '#f59e0b' : '#22c55e' }}>{detectionData.verdict}</span>
                      </div>
                    </div>

                    {/* Analysis Narrative */}
                    <div>
                      <h4 style={{ color: '#f87171', margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detailed Analysis</h4>
                      <p style={{ margin: 0, color: '#cbd5e1' }}>{detectionData.analysis}</p>
                    </div>

                    {/* Telltale Signs */}
                    {detectionData.telltaleSigns && detectionData.telltaleSigns.length > 0 && (
                      <div>
                        <h4 style={{ color: '#f87171', margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detected Signatures</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {detectionData.telltaleSigns.map((sign, i) => (
                            <li key={i}>{sign}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <style>
                      {`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                      `}
                    </style>
                  </div>
                ) : (
                  <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                    Failed to load analysis. The code block might be too small or the service is temporarily unavailable.
                  </div>
                )}
              </div>
            </div>
          )}

          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            isLoading={isLoading}
            activeLine={aiHighlightLine || (traceData && traceData.length > 0 && traceData[stepIndex] ? traceData[stepIndex].line : 0)}
            heatmapData={heatmapData} // 🔥 Pass Heatmap Data
          />
        </div>

        {/* RESIZABLE DIVIDER (Hidden on mobile) */}
        {!isMobile && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              width: '4px',
              background: isDragging ? 'var(--accent-cyan)' : 'var(--bg-app)',
              cursor: 'col-resize',
              position: 'relative',
              flexShrink: 0,
              transition: isDragging ? 'none' : 'background 0.2s ease',
            }}
          >
            {/* Visual indicator */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '2px',
              height: '32px',
              background: 'var(--border-ghost)',
              borderRadius: '4px'
            }} />
          </div>
        )}

        {/* RIGHT: TABS PANE */}
        <div style={{
          width: isMaximized ? '100%' : (isMobile ? '100%' : `${100 - editorWidth}%`), // 📱 Full width on mobile or when maximized
          height: isMobile ? '50%' : '100%',
          background: '#0A0A10', // Deep OLED terminal base
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>

          <div style={{ display: 'flex', padding: 0, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(17,17,22,0.5)' }}>
            <button
              onClick={() => setActiveTab('visualizer')}
              style={{
                background: activeTab === 'visualizer' ? 'var(--bg-panel)' : 'transparent',
                color: activeTab === 'visualizer' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'visualizer' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                padding: '12px 24px', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                fontFamily: 'var(--font-label)', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s', letterSpacing: '1px'
              }}
            >
              📊 VISUALIZER
            </button>
            <button
              onClick={() => setActiveTab('console')}
              style={{
                background: activeTab === 'console' ? 'var(--bg-panel)' : 'transparent',
                color: activeTab === 'console' ? 'var(--accent-violet)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'console' ? '2px solid var(--accent-violet)' : '2px solid transparent',
                padding: '12px 24px', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                fontFamily: 'var(--font-label)', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s', letterSpacing: '1px'
              }}
            >
              💻 CONSOLE
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              style={{
                background: activeTab === 'terminal' ? 'var(--bg-panel)' : 'transparent',
                color: activeTab === 'terminal' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'terminal' ? '2px solid var(--text-primary)' : '2px solid transparent',
                padding: '12px 24px', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                fontFamily: 'var(--font-label)', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s', letterSpacing: '1px'
              }}
            >
              🖥️ TERMINAL
            </button>

            {/* 🔥 MAXIMIZE / RESTORE BUTTON */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '15px' }}>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                style={{
                  background: isMaximized ? 'rgba(0,229,238,0.1)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: isMaximized ? '#00E5EE' : '#5A5A6A',
                  padding: '5px 14px',
                  borderRadius: '100px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
                  boxShadow: isMaximized ? '0 0 16px rgba(0,229,238,0.15)' : 'none'
                }}
              >
                {isMaximized ? '📉 RESTORE' : '📈 MAXIMIZE'}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '10px', overflow: 'auto' }}>

            {/* VISUALIZER TAB */}
            {activeTab === 'visualizer' && (
              // 🛡️ SAFETY CHECK: Only check .length if traceData exists and is an array
              (traceData && traceData.length > 0) ? (
                <>
                  <Canvas traceData={traceData} stepIndex={stepIndex} setStepIndex={setStepIndex} />
                  <ComplexityAnalyzer
                    code={code}
                    language={language}
                    isVisible={showComplexity}
                    onClose={() => setShowComplexity(false)}
                  />
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '50px', lineHeight: '1.6' }}>
                  {['python', 'javascript', 'java', 'cpp'].includes(language) ?
                    "Run code to see the visualization." :
                    `Visualization is not yet available for ${language}.\nCheck the Console tab for output.`}
                </div>
              )
            )}

            {/* CONSOLE TAB */}
            {activeTab === 'console' && (
              <div style={{
                background: 'var(--bg-surface)',
                color: 'var(--accent-cyan)',
                padding: '24px',
                fontFamily: 'var(--font-code)',
                minHeight: '100%',
                whiteSpace: 'pre-wrap',
                borderRadius: '10px',
                border: '1px solid var(--border-ghost)'
              }}>
                {error ? (
                  <>
                    <span style={{ color: 'red' }}>{error}</span>
                    {/* 💡 Inline AI Error Hint */}
                    <InlineErrorHint
                      error={error}
                      code={code}
                      language={language}
                    />
                  </>
                ) : (output || "No output generated.")}
              </div>
            )}

            {/* TERMINAL TAB */}
            {activeTab === 'terminal' && (
              <Terminal
                language={language}
                code={code}
                height="100%"
                style={{ border: 'none', borderRadius: 0 }}
              />
            )}

          </div>
        </div>
      </div>

      {/* AI Assistant - Floating Button */}
      <AIAssistant
        code={code}
        language={language}
        error={error}
      />

      {/* 🤖 Socratic Tutor - Floating Bubble */}
      <SocraticTutor
        code={code}
        language={language}
        error={error}
        executionState={traceData && traceData[stepIndex] ? traceData[stepIndex] : {}}
        isVisible={showTutor}
        onDismiss={() => { setShowTutor(false); setAiHighlightLine(null); }}
        onAiHighlight={setAiHighlightLine}
      />

      {/* 🎥 Session Recorder Integration */}
      {user && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999 }}>
          <SessionRecorder
            code={code}
            language={language}
            traceData={traceData}
            output={output}
            onCodeChange={handleSaveSession}
          />
        </div>
      )}
    </div>
  );
};

export default Practice;