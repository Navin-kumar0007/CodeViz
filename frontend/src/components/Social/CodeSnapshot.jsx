import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

/**
 * 📸 CODE SNAPSHOT — Social Card Generator
 * Generates beautiful, shareable code cards (like Carbon.sh)
 * with CodeViz branding for social media sharing.
 */
const CodeSnapshot = ({ isOpen, onClose, code, language, userName }) => {
    const cardRef = useRef(null);
    const [theme, setTheme] = useState('darkGradient');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showWatermark, setShowWatermark] = useState(true);

    const themes = {
        darkGradient: {
            name: 'Dark Gradient',
            bg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            codeBg: 'rgba(0, 0, 0, 0.4)',
            text: '#e4e4e7',
            accent: '#667eea',
            border: 'rgba(102, 126, 234, 0.3)'
        },
        oceanBlue: {
            name: 'Ocean Blue',
            bg: 'linear-gradient(135deg, #0c3547, #1b6b93, #4fc3f7)',
            codeBg: 'rgba(0, 0, 0, 0.35)',
            text: '#e0f7fa',
            accent: '#4fc3f7',
            border: 'rgba(79, 195, 247, 0.3)'
        },
        sunset: {
            name: 'Sunset',
            bg: 'linear-gradient(135deg, #2d1b69, #8b2252, #f4845f)',
            codeBg: 'rgba(0, 0, 0, 0.4)',
            text: '#fde2e4',
            accent: '#f4845f',
            border: 'rgba(244, 132, 95, 0.3)'
        },
        neon: {
            name: 'Neon',
            bg: 'linear-gradient(135deg, #000428, #004e92)',
            codeBg: 'rgba(0, 0, 0, 0.5)',
            text: '#00ff88',
            accent: '#00ff88',
            border: 'rgba(0, 255, 136, 0.3)'
        },
        midnight: {
            name: 'Midnight',
            bg: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
            codeBg: 'rgba(0, 0, 0, 0.3)',
            text: '#94a3b8',
            accent: '#7c3aed',
            border: 'rgba(124, 58, 237, 0.3)'
        }
    };

    const currentTheme = themes[theme];

    const langIcons = {
        python: '🐍',
        javascript: '⚡',
        java: '☕',
        cpp: '⚙️',
        c: '🔧'
    };

    // Simple syntax highlighting for the card
    const highlightCode = (codeStr) => {
        const lines = codeStr.split('\n').slice(0, 25); // Max 25 lines
        return lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', minHeight: '20px' }}>
                <span style={{
                    color: 'rgba(255,255,255,0.2)',
                    minWidth: '30px',
                    textAlign: 'right',
                    marginRight: '16px',
                    userSelect: 'none',
                    fontSize: '12px'
                }}>
                    {i + 1}
                </span>
                <span style={{ color: currentTheme.text, fontSize: '13px' }}>
                    {colorize(line)}
                </span>
            </div>
        ));
    };

    // Basic colorization
    const colorize = (line) => {
        const keywords = ['def ', 'return ', 'if ', 'else:', 'elif ', 'for ', 'while ', 'import ', 'from ', 'class ', 'const ', 'let ', 'var ', 'function ', 'print(', 'console.log('];
        const comments = line.match(/(#.*|\/\/.*)/);

        if (comments) {
            const idx = line.indexOf(comments[0]);
            return (
                <>
                    <span>{line.slice(0, idx)}</span>
                    <span style={{ color: '#6a9955', fontStyle: 'italic' }}>{comments[0]}</span>
                </>
            );
        }

        for (const kw of keywords) {
            if (line.trimStart().startsWith(kw)) {
                const kwIdx = line.indexOf(kw);
                return (
                    <>
                        <span>{line.slice(0, kwIdx)}</span>
                        <span style={{ color: '#c678dd' }}>{kw}</span>
                        <span>{line.slice(kwIdx + kw.length)}</span>
                    </>
                );
            }
        }

        // Highlight strings
        const strMatch = line.match(/(["'`])(.*?)\1/);
        if (strMatch) {
            const idx = line.indexOf(strMatch[0]);
            return (
                <>
                    <span>{line.slice(0, idx)}</span>
                    <span style={{ color: '#ce9178' }}>{strMatch[0]}</span>
                    <span>{line.slice(idx + strMatch[0].length)}</span>
                </>
            );
        }

        return line;
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `codeviz-snapshot-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Snapshot generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false
            });

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    alert('📋 Copied to clipboard!');
                }
            });
        } catch (err) {
            console.error('Copy failed:', err);
            alert('Copy failed. Try downloading instead.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>📸 Code Snapshot</h3>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Theme Selector */}
                <div style={styles.themeBar}>
                    {Object.entries(themes).map(([key, t]) => (
                        <button
                            key={key}
                            onClick={() => setTheme(key)}
                            style={{
                                ...styles.themeBtn,
                                background: t.bg,
                                border: theme === key ? `2px solid ${t.accent}` : '2px solid transparent',
                                transform: theme === key ? 'scale(1.1)' : 'scale(1)'
                            }}
                            title={t.name}
                        />
                    ))}
                    <label style={styles.watermarkToggle}>
                        <input
                            type="checkbox"
                            checked={showWatermark}
                            onChange={(e) => setShowWatermark(e.target.checked)}
                            style={{ marginRight: '6px' }}
                        />
                        <span style={{ fontSize: '11px', color: '#888' }}>Watermark</span>
                    </label>
                </div>

                {/* Preview Card */}
                <div style={styles.previewContainer}>
                    <div ref={cardRef} style={{
                        ...styles.card,
                        background: currentTheme.bg,
                    }}>
                        {/* Card Header */}
                        <div style={styles.cardHeader}>
                            <div style={styles.windowDots}>
                                <span style={{ ...styles.dot, background: '#ff5f57' }}></span>
                                <span style={{ ...styles.dot, background: '#febc2e' }}></span>
                                <span style={{ ...styles.dot, background: '#28c840' }}></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px' }}>{langIcons[language] || '📝'}</span>
                                <span style={{
                                    fontSize: '11px',
                                    color: currentTheme.accent,
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {language}
                                </span>
                            </div>
                        </div>

                        {/* Code Area */}
                        <div style={{
                            ...styles.codeArea,
                            background: currentTheme.codeBg,
                            border: `1px solid ${currentTheme.border}`
                        }}>
                            <pre style={styles.codeBlock}>
                                {highlightCode(code || '// No code to preview')}
                            </pre>
                        </div>

                        {/* Card Footer */}
                        {showWatermark && (
                            <div style={styles.cardFooter}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px' }}>{'{ }'}</span>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: currentTheme.accent
                                    }}>
                                        CodeViz
                                    </span>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                                        — Learn DSA Visually
                                    </span>
                                </div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                                    by {userName || 'Anonymous'} • {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        style={styles.downloadBtn}
                    >
                        {isGenerating ? '⏳ Generating...' : '💾 Download PNG'}
                    </button>
                    <button
                        onClick={handleCopyToClipboard}
                        disabled={isGenerating}
                        style={styles.copyBtn}
                    >
                        📋 Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        background: '#1a1a2e',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '700px',
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    modalTitle: {
        margin: 0,
        fontSize: '18px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#888',
        fontSize: '20px',
        cursor: 'pointer'
    },
    themeBar: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    themeBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    watermarkToggle: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto',
        cursor: 'pointer'
    },
    previewContainer: {
        marginBottom: '16px',
        borderRadius: '12px',
        overflow: 'hidden'
    },
    card: {
        padding: '24px',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        minHeight: '200px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    windowDots: {
        display: 'flex',
        gap: '6px'
    },
    dot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        display: 'inline-block'
    },
    codeArea: {
        borderRadius: '10px',
        padding: '16px',
        overflow: 'hidden'
    },
    codeBlock: {
        margin: 0,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        fontSize: '13px',
        lineHeight: '1.6',
        whiteSpace: 'pre',
        overflowX: 'auto'
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
    },
    actions: {
        display: 'flex',
        gap: '12px'
    },
    downloadBtn: {
        flex: 1,
        padding: '12px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px',
        transition: 'all 0.2s ease'
    },
    copyBtn: {
        flex: 1,
        padding: '12px',
        background: 'transparent',
        color: '#667eea',
        border: '1px solid #667eea',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px',
        transition: 'all 0.2s ease'
    }
};

export default CodeSnapshot;
