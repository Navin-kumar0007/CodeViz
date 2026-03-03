import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 🔊 VOICE NARRATOR
 * AI-powered narration for code execution steps
 * Uses Web Speech API (browser-native, zero dependencies)
 */
const VoiceNarrator = ({
    currentStep,
    stepIndex,
    playSpeed,
    currentVariables,
    previousVariables
}) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [voices, setVoices] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const utteranceRef = useRef(null);
    const lastSpokenStep = useRef(-1);

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            if (available.length > 0) {
                setVoices(available);
                // Prefer English voices
                const english = available.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
                    || available.find(v => v.lang.startsWith('en'))
                    || available[0];
                setSelectedVoice(english);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Map playback speed to speech rate
    const getSpeechRate = useCallback(() => {
        switch (playSpeed) {
            case 1500: return 0.8;  // 🐢 Slow
            case 800: return 1.0;  // 🚶 Normal
            case 300: return 1.4;  // 🏃 Fast
            case 100: return 1.8;  // ⚡ Instant
            default: return 1.0;
        }
    }, [playSpeed]);

    // Generate narration text from step data
    const generateNarration = useCallback((step, vars, prevVars) => {
        if (!step) return '';

        const parts = [];

        // Line info
        if (step.line) {
            parts.push(`Line ${step.line}`);
        }

        // Stdout (print statements)
        if (step.stdout) {
            parts.push(`Output: ${step.stdout.trim()}`);
        }

        // Variable changes
        if (vars && prevVars) {
            const changedVars = [];
            const newVars = [];

            for (const [key, value] of Object.entries(vars)) {
                if (key.startsWith('__') || key === 'undefined') continue;

                const displayValue = Array.isArray(value)
                    ? `array with ${value.length} elements`
                    : typeof value === 'object' && value !== null
                        ? 'object'
                        : String(value);

                if (!(key in prevVars)) {
                    newVars.push(`${key} is set to ${displayValue}`);
                } else if (JSON.stringify(prevVars[key]) !== JSON.stringify(value)) {
                    if (Array.isArray(value) && Array.isArray(prevVars[key])) {
                        if (value.length > prevVars[key].length) {
                            const added = value[value.length - 1];
                            changedVars.push(`${key}: appended ${added}`);
                        } else if (value.length < prevVars[key].length) {
                            changedVars.push(`${key}: removed element`);
                        } else {
                            changedVars.push(`${key} updated`);
                        }
                    } else {
                        changedVars.push(`${key} changed to ${displayValue}`);
                    }
                }
            }

            if (newVars.length > 0) parts.push(newVars.join('. '));
            if (changedVars.length > 0) parts.push(changedVars.join('. '));
        }

        return parts.join('. ') || `Executing line ${step.line || stepIndex + 1}`;
    }, [stepIndex]);

    // Speak narration when step changes
    useEffect(() => {
        if (!isEnabled || !currentStep || !selectedVoice) return;
        if (lastSpokenStep.current === stepIndex) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const text = generateNarration(currentStep, currentVariables, previousVariables);
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = getSpeechRate();
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utteranceRef.current = utterance;

        window.speechSynthesis.speak(utterance);
        lastSpokenStep.current = stepIndex;
    }, [stepIndex, isEnabled, currentStep, selectedVoice, generateNarration, getSpeechRate, currentVariables, previousVariables]);

    // Stop speech when disabled
    useEffect(() => {
        if (!isEnabled) {
            window.speechSynthesis.cancel();
        }
    }, [isEnabled]);

    // Stop speech on unmount
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    return (
        <div style={styles.container}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsEnabled(!isEnabled)}
                style={{
                    ...styles.toggleBtn,
                    background: isEnabled
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : 'transparent',
                    borderColor: isEnabled ? '#667eea' : 'rgba(255,255,255,0.2)',
                    color: isEnabled ? '#fff' : '#888'
                }}
                title={isEnabled ? 'Disable voice narration' : 'Enable voice narration'}
            >
                {isEnabled ? '🔊' : '🔇'}
            </button>

            {/* Settings Popover */}
            {isEnabled && (
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    style={styles.settingsBtn}
                    title="Voice settings"
                >
                    ⚙
                </button>
            )}

            {showSettings && isEnabled && (
                <div style={styles.settingsPanel}>
                    <div style={styles.settingsHeader}>
                        <span style={styles.settingsTitle}>🔊 Voice Settings</span>
                        <button onClick={() => setShowSettings(false)} style={styles.closeBtn}>✕</button>
                    </div>

                    <label style={styles.label}>Voice</label>
                    <select
                        value={selectedVoice?.name || ''}
                        onChange={(e) => {
                            const voice = voices.find(v => v.name === e.target.value);
                            setSelectedVoice(voice);
                        }}
                        style={styles.select}
                    >
                        {voices.filter(v => v.lang.startsWith('en')).map(v => (
                            <option key={v.name} value={v.name}>{v.name}</option>
                        ))}
                    </select>

                    <div style={styles.speedInfo}>
                        <span style={styles.label}>Speed</span>
                        <span style={styles.speedValue}>
                            {playSpeed === 1500 ? '🐢 Slow' :
                                playSpeed === 800 ? '🚶 Normal' :
                                    playSpeed === 300 ? '🏃 Fast' : '⚡ Instant'}
                        </span>
                    </div>
                    <div style={styles.hint}>
                        Voice speed auto-syncs with playback speed
                    </div>

                    {/* Test Button */}
                    <button
                        onClick={() => {
                            window.speechSynthesis.cancel();
                            const test = new SpeechSynthesisUtterance('Voice narration is active. Each step will be read aloud.');
                            test.voice = selectedVoice;
                            test.rate = getSpeechRate();
                            window.speechSynthesis.speak(test);
                        }}
                        style={styles.testBtn}
                    >
                        🎤 Test Voice
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    toggleBtn: {
        border: '1px solid',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    settingsBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#888',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'all 0.2s ease'
    },
    settingsPanel: {
        position: 'absolute',
        top: '40px',
        right: 0,
        background: 'rgba(30, 30, 45, 0.98)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        padding: '14px',
        zIndex: 100,
        width: '240px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    },
    settingsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    settingsTitle: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#fff'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: '14px'
    },
    label: {
        fontSize: '10px',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
        display: 'block'
    },
    select: {
        width: '100%',
        padding: '6px 8px',
        background: '#1e1e2e',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '6px',
        fontSize: '11px',
        marginBottom: '10px',
        outline: 'none'
    },
    speedInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
    },
    speedValue: {
        fontSize: '12px',
        color: '#4fc3f7',
        fontWeight: 'bold'
    },
    hint: {
        fontSize: '9px',
        color: '#666',
        fontStyle: 'italic',
        marginBottom: '10px'
    },
    testBtn: {
        width: '100%',
        padding: '8px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
        transition: 'all 0.2s ease'
    }
};

export default VoiceNarrator;
