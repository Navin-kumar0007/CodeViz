import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';

// Map CodeViz language ids -> Monaco language ids (Monaco supports these natively)
const MONACO_LANG = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rust',
};

// ⚡️ NOW ACCEPTS 'activeLine' AND 'heatmapData' PROPS
const CodeEditor = ({ code, setCode, language, activeLine, heatmapData }) => {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const heatmapDecorationsRef = useRef([]);
  const { colors } = useTheme();

  // 1. Capture Editor Instance on Mount
  // 1. Capture Editor Instance on Mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // 2. Load/Save Logic (Same as before)
  useEffect(() => {
    // 🛡️ SKIP LOADING if setCode is not provided (ReadOnly Mode)
    if (!setCode) return;

    const savedCode = localStorage.getItem(`code_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      if (language === 'python') setCode('# Python Code\nprint("Hello")');
      if (language === 'javascript') setCode('// JS Code\nconsole.log("Hello");');
      if (language === 'java') setCode('// Java Code\nint x = 10;');
      if (language === 'cpp') setCode('// C++ Code\nint x = 10;');
    }
  }, [language, setCode]);

  const handleEditorChange = (value) => {
    // 🛡️ SKIP SAVING if setCode is not provided
    if (setCode) {
      setCode(value);
      localStorage.setItem(`code_${language}`, value);
    }
  };

  // 3. ⚡️ ACTIVE LINE HIGHLIGHTING LOGIC
  useEffect(() => {
    if (editorRef.current && activeLine > 0) {
      const editor = editorRef.current;

      // Define the new decoration (Highlight)
      const newDecorations = [
        {
          range: {
            startLineNumber: activeLine,
            startColumn: 1,
            endLineNumber: activeLine,
            endColumn: 1
          },
          options: {
            isWholeLine: true,
            className: 'active-line-decoration', // Uses our new CSS class
            glyphMarginClassName: 'active-line-glyph' // Optional icon gutter
          }
        }
      ];

      // Apply decoration (and remove old ones)
      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );

      // Scroll to the line so user never loses track
      editor.revealLineInCenter(activeLine);
    } else if (editorRef.current) {
      // Clear if no active line
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeLine]);

  // 4. 🔥 VISUAL BIG-O HEATMAP LOGIC
  useEffect(() => {
    if (editorRef.current && heatmapData && Object.keys(heatmapData).length > 0) {
      const editor = editorRef.current;
      const hitCounts = Object.values(heatmapData);
      const maxHits = Math.max(...hitCounts);

      const newHeatmapDecorations = Object.entries(heatmapData).map(([line, count]) => {
        const intensity = count / maxHits;
        let className = 'heatmap-low';
        if (intensity > 0.7) className = 'heatmap-high';
        else if (intensity > 0.3) className = 'heatmap-med';

        return {
          range: {
            startLineNumber: parseInt(line),
            startColumn: 1,
            endLineNumber: parseInt(line),
            endColumn: 1
          },
          options: {
            isWholeLine: true,
            className: className,
            marginClassName: 'heatmap-margin'
          }
        };
      });

      heatmapDecorationsRef.current = editor.deltaDecorations(
        heatmapDecorationsRef.current,
        newHeatmapDecorations
      );
    } else if (editorRef.current) {
      heatmapDecorationsRef.current = editorRef.current.deltaDecorations(heatmapDecorationsRef.current, []);
    }
  }, [heatmapData]);

  return (
    <div style={{ height: '100%', borderRadius: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      <Editor
        height="100%"
        defaultLanguage={MONACO_LANG[language] || language}
        language={MONACO_LANG[language] || language}
        theme={colors.editorTheme}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount} // 👈 Hook to capture editor
        options={{
          fontSize: window.innerWidth < 768 ? 12 : 14, // 📱 Mobile optimization
          minimap: { enabled: false }, // Save space on mobile
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 15 },
          lineNumbers: window.innerWidth < 768 ? 'off' : 'on', // Hide line numbers on very small screens to save space
          glyphMargin: false,
          wordWrap: 'on' // Enable word wrap for mobile
        }}
      />
    </div>
  );
};

export default CodeEditor;