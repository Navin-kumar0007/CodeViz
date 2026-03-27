import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfflinePythonRunner from '../src/engine/offlinePythonRunner';

export default function VisualizerScreen({ navigation }) {
    const [code, setCode] = useState('def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n\nfor i in range(5):\n    print(fib(i))');
    const [trace, setTrace] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isRunnerReady, setIsRunnerReady] = useState(false);
    const runnerRef = useRef(null);

    const handleRun = () => {
        setIsExecuting(true);
        setTrace([]);
        setStepIndex(0);
        runnerRef.current?.runCode(code);
    };

    const handleResult = (result) => {
        setTrace(result);
        setIsExecuting(false);
    };

    const handleNext = () => {
        if (stepIndex < trace.length - 1) setStepIndex(stepIndex + 1);
    };

    const handlePrev = () => {
        if (stepIndex > 0) setStepIndex(stepIndex - 1);
    };

    const currentStep = trace[stepIndex] || {};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>⚡ Offline Playground</Text>
            </View>

            <View style={styles.editorPane}>
                <TextInput
                    style={styles.editor}
                    multiline
                    value={code}
                    onChangeText={setCode}
                    spellCheck={false}
                    autoCapitalize="none"
                    placeholderTextColor="#4a5070"
                />
                <TouchableOpacity 
                    style={[styles.runButton, !isRunnerReady && { opacity: 0.5 }]} 
                    onPress={handleRun}
                    disabled={isExecuting || !isRunnerReady}
                >
                    <Text style={styles.runButtonText}>
                        {isExecuting ? 'Tracing...' : isRunnerReady ? '▶ Run Offline' : '⏳ Initializing Pyodide...'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.visualizerPane}>
                {trace.length > 0 ? (
                    <View style={styles.traceContent}>
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={handlePrev} style={styles.stepBtn} disabled={stepIndex === 0}>
                                <Ionicons name="play-skip-back" size={24} color={stepIndex === 0 ? "#4a5070" : "#0df2f2"} />
                            </TouchableOpacity>
                            <Text style={styles.stepText}>STEP {stepIndex + 1} / {trace.length}</Text>
                            <TouchableOpacity onPress={handleNext} style={styles.stepBtn} disabled={stepIndex === trace.length - 1}>
                                <Ionicons name="play-skip-forward" size={24} color={stepIndex === trace.length - 1 ? "#4a5070" : "#0df2f2"} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.variables}>
                            <Text style={styles.varHeader}>Variables at Line {currentStep.line}:</Text>
                            {Object.entries(currentStep.variables || {}).map(([key, val]) => (
                                <View key={key} style={styles.varRow}>
                                    <Text style={styles.varKey}>{key}:</Text>
                                    <Text style={styles.varVal}>{JSON.stringify(val)}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="flask-outline" size={48} color="#4a5070" />
                        <Text style={styles.emptyText}>Run some code to see the magic! ✨</Text>
                    </View>
                )}
            </View>

            <OfflinePythonRunner 
                ref={runnerRef}
                onReady={() => setIsRunnerReady(true)}
                onResult={handleResult}
                onError={(err) => { alert(err); setIsExecuting(false); }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050508' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, background: '#0a0a0f', borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0df2f2', marginLeft: 15 },
    backButton: { marginRight: 5 },
    editorPane: { flex: 1, padding: 15 },
    editor: { flex: 1, backgroundColor: '#0a0a0f', color: '#e0e5ff', padding: 15, borderRadius: 12, fontSize: 14, fontFamily: 'monospace', textAlignVertical: 'top' },
    runButton: { backgroundColor: '#0df2f2', padding: 15, borderRadius: 12, marginTop: 15, alignItems: 'center', boxShadow: '0 0 20px rgba(13, 242, 242, 0.3)' },
    runButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    visualizerPane: { flex: 0.8, backgroundColor: 'rgba(13, 242, 242, 0.05)', borderTopWidth: 1, borderTopColor: '#1a1a2e', padding: 20 },
    traceContent: { flex: 1 },
    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    stepText: { color: '#8890b5', fontSize: 14, fontWeight: 'bold' },
    variables: { flex: 1 },
    varHeader: { color: '#0df2f2', fontSize: 12, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
    varRow: { flexDirection: 'row', marginBottom: 8, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 6 },
    varKey: { color: '#a45afe', fontWeight: 'bold', marginRight: 10, width: 80 },
    varVal: { color: '#e0e5ff', flex: 1 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#4a5070', marginTop: 15, fontSize: 14, textAlign: 'center' }
});
