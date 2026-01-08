import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';

// ⚡️ NOW ACCEPTS 'activeLine' PROP
const CodeEditor = ({ code, setCode, language, activeLine }) => {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const { colors } = useTheme();

  // 1. Capture Editor Instance on Mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // 2. Load/Save Logic (Same as before)
  useEffect(() => {
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
    setCode(value);
    localStorage.setItem(`code_${language}`, value);
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

  return (
    <div style={{ height: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
      <Editor
        height="100%"
        defaultLanguage={language === 'java' || language === 'cpp' ? 'java' : language}
        language={language === 'java' || language === 'cpp' ? 'java' : language}
        theme={colors.editorTheme}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount} // 👈 Hook to capture editor
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 15 },
          lineNumbers: 'on',
          glyphMargin: false
        }}
      />
    </div>
  );
};

export default CodeEditor;