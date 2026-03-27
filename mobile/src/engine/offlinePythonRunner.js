/**
 * 🐍 Offline Python Runner for Mobile
 * Leverages Pyodide (WASM) inside a hidden WebView for local execution and tracing.
 */

import React, { useRef, useState, useEffect } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// The HTML bridge file we created
const bridgeHtml = require('../../assets/pyodide_bridge.html');

const OfflinePythonRunner = ({ onReady, onResult, onError }) => {
    const webViewRef = useRef(null);

    const handleMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        
        switch (data.type) {
            case 'ready':
                if (onReady) onReady();
                break;
            case 'result':
                if (onResult) onResult(data.trace);
                break;
            case 'error':
                if (onError) onError(data.error);
                break;
        }
    };

    // Public method to trigger execution
    const runCode = (code) => {
        if (webViewRef.current) {
            const script = `window.runPython(\`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)`;
            webViewRef.current.injectJavaScript(script);
        }
    };

    return (
        <View style={{ height: 0, width: 0, opacity: 0 }}>
            <WebView
                ref={webViewRef}
                source={bridgeHtml}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
            />
        </View>
    );
};

export default OfflinePythonRunner;
