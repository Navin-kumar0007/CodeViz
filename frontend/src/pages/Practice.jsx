import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CodeEditor from "../components/Editor/CodeEditor";
import Canvas from "../components/Visualizer/Canvas";

// 👇 IMPORT FROM YOUR EXAMPLES FILE
import { EXAMPLES } from "../examples";
import { useTheme } from "../contexts/ThemeContext";

const Practice = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const { theme, toggleTheme } = useTheme();

  // Default Language
  const defaultLang = "python";

  // State
  const [language, setLanguage] = useState(defaultLang);

  // Initialize Code safely
  const [code, setCode] = useState(() => {
    if (EXAMPLES && EXAMPLES[defaultLang]) {
      const firstAlgo = Object.keys(EXAMPLES[defaultLang])[0];
      return EXAMPLES[defaultLang][firstAlgo];
    }
    return "";
  });

  // 🛡️ STATE INITIALIZATION: Always start as an empty array []
  const [traceData, setTraceData] = useState([]);
  const [output, setOutput] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("visualizer");

  const [snippets, setSnippets] = useState([]);
  const [showSnippetList, setShowSnippetList] = useState(false);

  // 📏 RESIZABLE SPLIT PANE STATE
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);

  // ⚡ PERFORMANCE: Loading state and RAF for smooth resize
  const [isExecuting, setIsExecuting] = useState(false);
  const rafRef = useRef(null);

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
    setTraceData([]); // Reset to empty array, NOT undefined
    setOutput("");
    setStepIndex(0);

    try {
      const res = await axios.post("http://localhost:5001/run", { language, code });

      // 1. Handle Server-Side Errors
      if (res.data.error) {
        setError(res.data.error);
        setActiveTab("console");
      }

      // 2. Handle JavaScript (Special JSON Parsing)
      else if (language === 'javascript') {
        try {
          const parsedTrace = typeof res.data.output === 'string'
            ? JSON.parse(res.data.output)
            : res.data.output;

          if (Array.isArray(parsedTrace)) {
            setTraceData(parsedTrace);

            // Extract logs
            let logs = "";
            parsedTrace.forEach(step => {
              if (step.stdout) logs += step.stdout;
            });
            setOutput(logs || "Visualization Started...");
            setActiveTab("visualizer");
          } else {
            throw new Error("Output is not a valid trace array");
          }
        } catch (e) {
          setOutput(res.data.output || "No output");
          setActiveTab("console");
        }
      }

      // 3. Handle C++ / Java (Text Only)
      else if (res.data.output) {
        setOutput(res.data.output);
        setTraceData([]);
        setActiveTab("console");
      }

      // 4. Handle Python (Standard Visualization)
      else {
        // 🛡️ CRITICAL FIX: Default to [] if trace is missing
        const safeTrace = res.data.trace || [];
        setTraceData(safeTrace);

        let logs = "";
        if (safeTrace.length > 0) {
          safeTrace.forEach(step => {
            if (step.stdout) logs += step.stdout + "\n";
          });
          setOutput(logs || "Visualization Started...");
          setActiveTab("visualizer");
        } else {
          // If backend returned success but no trace, usually print output only
          setOutput("No visualization data generated. (Did the code run?)");
          setActiveTab("console");
        }
      }

    } catch (err) {
      console.error(err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setIsLoading(false);
      setIsExecuting(false); // Clear loading indicator
    }
  };

  // 💾 SAVE CODE
  const handleSave = async () => {
    if (!user) return alert("Please login to save code!");
    const title = prompt("Name this snippet:");
    if (!title) return;

    try {
      await axios.post("http://localhost:5001/api/snippets", {
        userId: user._id, title, code, language
      });
      alert("✅ Saved successfully!");
      fetchSnippets();
    } catch (err) {
      alert("❌ Save failed: " + err.message);
    }
  };

  // 📂 LOAD SNIPPETS
  const fetchSnippets = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://localhost:5001/api/snippets/${user._id}`);
      // 🛡️ SAFETY CHECK: Ensure it's an array
      setSnippets(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (user) fetchSnippets(); }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1e1e1e', color: '#fff' }}>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#252526', borderBottom: '1px solid #333', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>CodeViz <span style={{ fontSize: '12px', color: '#aaa' }}>Practice</span></h2>
          <button onClick={() => navigate('/')} style={{ background: '#333', color: '#aaa', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>← Dashboard</button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowSnippetList(!showSnippetList)} style={{ background: '#444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>📂 My Snippets</button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid #555',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Snippet Dropdown */}
          {showSnippetList && (
            <div style={{ position: 'absolute', top: '50px', right: '120px', background: '#333', padding: '10px', zIndex: 100, border: '1px solid #555', borderRadius: '5px', width: '200px', maxHeight: '300px', overflowY: 'auto' }}>
              {snippets.length === 0 && <div style={{ padding: '5px', color: '#aaa', fontSize: '12px' }}>No saved codes yet.</div>}
              {snippets.map(s => (
                <div key={s._id} onClick={() => { setCode(s.code); setLanguage(s.language); setShowSnippetList(false) }} style={{ cursor: 'pointer', padding: '8px', borderBottom: '1px solid #444', fontSize: '13px' }}>
                  <div style={{ fontWeight: 'bold' }}>{s.title}</div>
                  <div style={{ fontSize: '10px', color: '#aaa' }}>{s.language}</div>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSave} style={{ background: '#2ea043', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save Code</button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div style={{ padding: '10px 20px', background: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', gap: '15px', alignItems: 'center' }}>

        {/* RUN BUTTON */}
        <button onClick={runCode} disabled={isLoading || isExecuting} style={{ background: 'linear-gradient(135deg, #2ea043, #26843b)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(46, 160, 67, 0.3)' }}>    {isLoading ? 'Running...' : '▶ Run Code'}
        </button>

        <select value={language} onChange={handleLanguageChange} style={{ padding: '8px', borderRadius: '4px', background: '#333', color: 'white', border: '1px solid #555' }}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <select onChange={handleAlgoChange} style={{ padding: '8px', borderRadius: '4px', background: '#333', color: 'white', border: '1px solid #555', minWidth: '200px' }}>
          <option value="">Select an Example...</option>
          {EXAMPLES[language] ? (
            Object.keys(EXAMPLES[language]).map(algo => (
              <option key={algo} value={algo}>{algo}</option>
            ))
          ) : (
            <option disabled>No examples available</option>
          )}
        </select>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div
        style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', userSelect: isDragging ? 'none' : 'auto' }}
        onMouseMove={handleMouseMove}
      >

        {/* LEFT: EDITOR */}
        <div style={{ width: `${editorWidth}%`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            isLoading={isLoading}
            activeLine={traceData && traceData.length > 0 && traceData[stepIndex] ? traceData[stepIndex].line : 0}
          />
        </div>

        {/* RESIZABLE DIVIDER */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: '6px',
            background: isDragging ? '#007acc' : '#444',
            cursor: 'col-resize',
            position: 'relative',
            flexShrink: 0,
            transition: isDragging ? 'none' : 'background 0.2s ease',
            ':hover': {
              background: '#007acc'
            }
          }}
        >
          {/* Visual indicator */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '3px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px'
          }} />
        </div>

        {/* RIGHT: TABS PANE */}
        <div style={{ width: `${100 - editorWidth}%`, background: '#1e1e1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#252526' }}>
            <button
              onClick={() => setActiveTab('visualizer')}
              style={{
                flex: 1, padding: '10px', background: activeTab === 'visualizer' ? '#1e1e1e' : 'transparent',
                color: activeTab === 'visualizer' ? '#fff' : '#aaa', border: 'none', cursor: 'pointer', borderTop: activeTab === 'visualizer' ? '2px solid #007acc' : 'none'
              }}
            >
              📊 Visualizer
            </button>
            <button
              onClick={() => setActiveTab('console')}
              style={{
                flex: 1, padding: '10px', background: activeTab === 'console' ? '#1e1e1e' : 'transparent',
                color: activeTab === 'console' ? '#fff' : '#aaa', border: 'none', cursor: 'pointer', borderTop: activeTab === 'console' ? '2px solid #007acc' : 'none'
              }}
            >
              💻 Console Output
            </button>
          </div>

          <div style={{ flex: 1, padding: '10px', overflow: 'auto' }}>

            {/* VISUALIZER TAB */}
            {activeTab === 'visualizer' && (
              // 🛡️ SAFETY CHECK: Only check .length if traceData exists and is an array
              (traceData && traceData.length > 0) ? (
                <Canvas traceData={traceData} stepIndex={stepIndex} setStepIndex={setStepIndex} />
              ) : (
                <div style={{ color: '#666', textAlign: 'center', marginTop: '50px', lineHeight: '1.6' }}>
                  {language === 'python' || language === 'javascript' ?
                    "Run code to see the visualization." :
                    "Visualization is only available for Python and JavaScript.\nCheck the Console tab for output."}
                </div>
              )
            )}

            {/* CONSOLE TAB */}
            {activeTab === 'console' && (
              <div style={{
                background: '#000',
                color: '#0f0',
                padding: '15px',
                fontFamily: 'monospace',
                minHeight: '100%',
                whiteSpace: 'pre-wrap',
                borderRadius: '5px'
              }}>
                {error ? <span style={{ color: 'red' }}>{error}</span> : (output || "No output generated.")}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;