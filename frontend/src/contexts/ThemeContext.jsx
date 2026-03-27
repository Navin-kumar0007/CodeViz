import React, { createContext, useState, useContext, useEffect } from 'react';

// 🎨 THEME COLOR PALETTES
const themes = {
    dark: {
        // Backgrounds
        background: '#1E293B',
        backgroundGradientStart: '#1E293B',
        backgroundGradientEnd: '#0F172A',
        surface: '#334155',
        elevated: '#475569',

        // Borders & Dividers
        border: '#444',
        divider: 'rgba(255, 255, 255, 0.1)',

        // Text
        textPrimary: '#ffffff',
        textSecondary: '#aaa',
        textMuted: '#666',

        // Brand Colors
        primary: '#007acc',
        primaryHover: '#0098ff',
        success: 'var(--accent-teal)',
        successHover: 'var(--accent-teal-hover)',
        warning: 'var(--accent-yellow)',
        error: '#f87171',

        // Interactive
        buttonBg: '#333',
        buttonHover: '#444',
        inputBg: 'rgba(37, 37, 38, 0.8)',

        // Visualization Colors
        arrayGradientStart: 'var(--accent-teal)',
        arrayGradientEnd: 'var(--accent-purple)',
        stackColor: 'var(--accent-yellow)',
        queueColor: '#4299e1',
        treeColor: '#4fc3f7',
        graphColor: 'var(--accent-teal)',
        linkedListColor: '#4fc3f7',

        // Glass Effects
        glassBackground: 'rgba(255, 255, 255, 0.05)',
        glassBackdrop: 'blur(10px)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        glassShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',

        // Editor
        editorTheme: 'vs-dark',
        activeLineColor: 'rgba(79, 195, 247, 0.15)',
        activeLineBorder: '#4fc3f7'
    },

    light: {
        // Backgrounds
        background: '#ffffff',
        backgroundGradientStart: '#f8f9fa',
        backgroundGradientEnd: '#e9ecef',
        surface: '#f5f5f5',
        elevated: '#ffffff',

        // Borders & Dividers
        border: '#d4d4d4',
        divider: 'rgba(0, 0, 0, 0.1)',

        // Text
        textPrimary: '#1e1e1e',
        textSecondary: '#666',
        textMuted: '#999',

        // Brand Colors
        primary: '#0066b8',
        primaryHover: '#0078d4',
        success: '#16a34a',
        successHover: '#15803d',
        warning: '#ea580c',
        error: '#dc2626',

        // Interactive
        buttonBg: '#e5e5e5',
        buttonHover: '#d4d4d4',
        inputBg: 'rgba(255, 255, 255, 0.9)',

        // Visualization Colors
        arrayGradientStart: '#5b6fc7',
        arrayGradientEnd: '#6b4ba0',
        stackColor: '#ea580c',
        queueColor: '#0284c7',
        treeColor: '#0891b2',
        graphColor: '#5b6fc7',
        linkedListColor: '#0891b2',

        // Glass Effects
        glassBackground: 'rgba(255, 255, 255, 0.7)',
        glassBackdrop: 'blur(10px)',
        glassBorder: 'rgba(0, 0, 0, 0.1)',
        glassShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',

        // Editor
        editorTheme: 'light',
        activeLineColor: 'rgba(0, 120, 212, 0.1)',
        activeLineBorder: '#0078d4'
    }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Load theme from localStorage or default to 'dark'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('codeVizTheme');
        return savedTheme || 'light';
    });

    // Toggle between themes
    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('codeVizTheme', newTheme);
            return newTheme;
        });
    };

    // Set data-theme attribute on document for CSS
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const colors = themes[theme];

    const value = {
        theme,
        colors,
        toggleTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use theme
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export default ThemeContext;
