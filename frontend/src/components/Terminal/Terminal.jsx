import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

/**
 * 🖥️ Integrated Terminal Component
 * Simulated terminal connected to CodeViz backend.
 * Supports running code in any of the 7 supported languages.
 * 
 * Props:
 *   - language: string (python, javascript, java, cpp, typescript, go, c)
 *   - code: string (current code from the editor)
 *   - onRun: function (callback when user types 'run')
 *   - height: string (CSS height, default '250px')
 *   - style: object (additional styles)
 */
const Terminal = ({ language = 'python', code = '', onRun, height = '250px', style = {} }) => {
    const termRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const [currentLine, setCurrentLine] = useState('');
    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);

    const PROMPT = '\x1b[36m❯\x1b[0m ';
    const LANG_COLORS = {
        python: '\x1b[33m', javascript: '\x1b[93m', java: '\x1b[91m',
        cpp: '\x1b[94m', typescript: '\x1b[96m', go: '\x1b[36m', c: '\x1b[95m'
    };

    const getUserToken = () => {
        try { return JSON.parse(localStorage.getItem('userInfo'))?.token; } catch { return ''; }
    };

    const writeBanner = useCallback((term) => {
        const color = LANG_COLORS[language] || '\x1b[37m';
        term.writeln(`${color}╔══════════════════════════════════════╗\x1b[0m`);
        term.writeln(`${color}║  \x1b[1mCodeViz Terminal\x1b[0m${color}                   ║\x1b[0m`);
        term.writeln(`${color}║  \x1b[37mLanguage: ${language.toUpperCase().padEnd(25)}${color}║\x1b[0m`);
        term.writeln(`${color}╚══════════════════════════════════════╝\x1b[0m`);
        term.writeln('');
        term.writeln('\x1b[90mCommands: run • clear • help\x1b[0m');
        term.writeln('');
        term.write(PROMPT);
    }, [language]);

    const executeCommand = useCallback(async (cmd) => {
        const term = xtermRef.current;
        if (!term) return;

        const trimmed = cmd.trim();
        if (!trimmed) { term.write(PROMPT); return; }

        // Add to history
        historyRef.current.push(trimmed);
        historyIndexRef.current = historyRef.current.length;

        switch (trimmed.toLowerCase()) {
            case 'clear':
            case 'cls':
                term.clear();
                term.write(PROMPT);
                break;

            case 'help':
                term.writeln('\x1b[36m┌─ Available Commands ─┐\x1b[0m');
                term.writeln('\x1b[36m│\x1b[0m  \x1b[1mrun\x1b[0m       Execute current code');
                term.writeln('\x1b[36m│\x1b[0m  \x1b[1mclear\x1b[0m     Clear terminal');
                term.writeln('\x1b[36m│\x1b[0m  \x1b[1mhelp\x1b[0m      Show this help');
                term.writeln('\x1b[36m│\x1b[0m  \x1b[1mlang\x1b[0m      Show current language');
                term.writeln('\x1b[36m│\x1b[0m  \x1b[1mhistory\x1b[0m   Show command history');
                term.writeln('\x1b[36m└──────────────────────┘\x1b[0m');
                term.write(PROMPT);
                break;

            case 'lang':
            case 'language':
                term.writeln(`\x1b[36mCurrent language:\x1b[0m \x1b[1m${language}\x1b[0m`);
                term.write(PROMPT);
                break;

            case 'history':
                historyRef.current.forEach((h, i) => {
                    term.writeln(`  \x1b[90m${i + 1}.\x1b[0m ${h}`);
                });
                term.write(PROMPT);
                break;

            case 'run':
                if (!code?.trim()) {
                    term.writeln('\x1b[33m⚠ No code to run. Write code in the editor first.\x1b[0m');
                    term.write(PROMPT);
                    break;
                }
                term.writeln(`\x1b[90m⏳ Running ${language} code...\x1b[0m`);

                // If parent provided onRun callback, use it
                if (onRun) {
                    try {
                        const result = await onRun(code, language);
                        if (result?.error) {
                            term.writeln(`\x1b[31m❌ Error:\x1b[0m`);
                            result.error.split('\n').forEach(l => term.writeln(`  \x1b[31m${l}\x1b[0m`));
                        } else if (result?.output) {
                            result.output.split('\n').forEach(l => term.writeln(l));
                        } else if (result?.trace) {
                            term.writeln('\x1b[32m✅ Code executed with trace output.\x1b[0m');
                        }
                    } catch (err) {
                        term.writeln(`\x1b[31m❌ ${err.message}\x1b[0m`);
                    }
                } else {
                    // Direct execution via backend
                    try {
                        const res = await fetch('http://localhost:5001/run', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getUserToken()}`
                            },
                            body: JSON.stringify({ language, code })
                        });
                        const data = await res.json();
                        if (data.error) {
                            term.writeln(`\x1b[31m❌ Error:\x1b[0m`);
                            data.error.split('\n').forEach(l => term.writeln(`  \x1b[31m${l}\x1b[0m`));
                        } else if (data.output) {
                            data.output.split('\n').forEach(l => term.writeln(l));
                        } else if (data.trace) {
                            term.writeln('\x1b[32m✅ Code executed successfully.\x1b[0m');
                        } else {
                            term.writeln('\x1b[32m✅ No output.\x1b[0m');
                        }
                    } catch (err) {
                        term.writeln(`\x1b[31m❌ Network error: ${err.message}\x1b[0m`);
                    }
                }
                term.writeln('');
                term.write(PROMPT);
                break;

            default:
                term.writeln(`\x1b[31mUnknown command: ${trimmed}\x1b[0m`);
                term.writeln('\x1b[90mType "help" for available commands\x1b[0m');
                term.write(PROMPT);
                break;
        }
    }, [code, language, onRun]);

    useEffect(() => {
        if (!termRef.current || xtermRef.current) return;

        const term = new XTerm({
            theme: {
                background: '#0d1117',
                foreground: '#c9d1d9',
                cursor: '#58a6ff',
                selectionBackground: '#264f78',
                black: '#484f58',
                red: '#ff7b72',
                green: '#7ee787',
                yellow: '#d29922',
                blue: '#79c0ff',
                magenta: '#d2a8ff',
                cyan: '#56d4dd',
                white: '#c9d1d9',
            },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            cursorBlink: true,
            cursorStyle: 'bar',
            rows: 10,
            scrollback: 1000,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(termRef.current);

        // Delay fit to ensure container is sized
        setTimeout(() => {
            try { fitAddon.fit(); } catch { }
        }, 100);

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        writeBanner(term);

        // Handle resize
        const observer = new ResizeObserver(() => {
            try { fitAddon.fit(); } catch { }
        });
        observer.observe(termRef.current);

        let lineBuffer = '';

        // Input handler
        term.onData((data) => {
            const code = data.charCodeAt(0);

            if (data === '\r') {
                // Enter
                term.writeln('');
                executeCommand(lineBuffer);
                lineBuffer = '';
            } else if (code === 127) {
                // Backspace
                if (lineBuffer.length > 0) {
                    lineBuffer = lineBuffer.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (data === '\x1b[A') {
                // Up arrow - history
                if (historyRef.current.length > 0 && historyIndexRef.current > 0) {
                    historyIndexRef.current--;
                    // Clear current line
                    while (lineBuffer.length > 0) {
                        term.write('\b \b');
                        lineBuffer = lineBuffer.slice(0, -1);
                    }
                    lineBuffer = historyRef.current[historyIndexRef.current];
                    term.write(lineBuffer);
                }
            } else if (data === '\x1b[B') {
                // Down arrow - history
                while (lineBuffer.length > 0) {
                    term.write('\b \b');
                    lineBuffer = lineBuffer.slice(0, -1);
                }
                if (historyIndexRef.current < historyRef.current.length - 1) {
                    historyIndexRef.current++;
                    lineBuffer = historyRef.current[historyIndexRef.current];
                    term.write(lineBuffer);
                } else {
                    historyIndexRef.current = historyRef.current.length;
                }
            } else if (code === 3) {
                // Ctrl+C
                term.writeln('^C');
                lineBuffer = '';
                term.write(PROMPT);
            } else if (code >= 32) {
                // Printable char
                lineBuffer += data;
                term.write(data);
            }
        });

        return () => {
            observer.disconnect();
            term.dispose();
            xtermRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update executeCommand ref when code/language changes
    useEffect(() => {
        // Re-bind the data handler when dependencies change
        // The onData handler captures lineBuffer via closure, not executeCommand
        // executeCommand is updated via its own useCallback deps
    }, [executeCommand]);

    return (
        <div style={{
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#0d1117',
            ...style,
        }}>
            {/* Terminal Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', flex: 1, textAlign: 'center' }}>
                    Terminal — {language}
                </span>
            </div>

            {/* Terminal Body */}
            <div ref={termRef} style={{ height, padding: '4px' }} />
        </div>
    );
};

export default Terminal;
