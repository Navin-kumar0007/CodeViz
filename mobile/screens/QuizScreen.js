import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';

const API_URL = 'http://10.162.38.72:5001/api';

export default function QuizScreen({ route, navigation }) {
    const { quizId } = route.params;
    const { userToken } = useContext(AuthContext);

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchQuizDetails();
    }, []);

    const fetchQuizDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/quizzes/${quizId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setQuiz(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            Alert.alert('Error', 'Could not load quiz details');
            navigation.goBack();
        }
    };

    const handleOptionSelect = (index) => {
        setSelectedOption(index);
    };

    const handleNextQuestion = () => {
        const currentQuestion = quiz.questions[currentQuestionIndex];

        // Check answer
        if (selectedOption === currentQuestion.correctAnswer) {
            setScore(score + 1);
        }

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setIsSubmitting(true);
        // Calculate final score logic if needed before state update for submission
        // Since setScore is async, we calculate final score locally
        const currentQuestion = quiz.questions[currentQuestionIndex];
        let finalScore = score;
        if (selectedOption === currentQuestion.correctAnswer) {
            finalScore += 1;
        }

        const percentage = Math.round((finalScore / quiz.questions.length) * 100);

        try {
            await axios.post(`${API_URL}/quizzes/${quizId}/complete`, {
                score: percentage
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setScore(finalScore);
            setIsCompleted(true);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            // Even if API fails, show local results
            setScore(finalScore);
            setIsCompleted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    if (isCompleted) {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.resultContainer}>
                    <Ionicons name="trophy" size={80} color="#ffd700" />
                    <Text style={styles.resultTitle}>Quiz Completed!</Text>
                    <Text style={styles.resultScore}>{percentage}%</Text>
                    <Text style={styles.resultSubtext}>You got {score} out of {quiz.questions.length} correct</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Back to Practice</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Question {currentQuestionIndex + 1}/{quiz.questions.length}</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }]} />
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>

                {currentQuestion.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionCard,
                            selectedOption === index && styles.optionSelected
                        ]}
                        onPress={() => handleOptionSelect(index)}
                    >
                        <View style={[
                            styles.radioButton,
                            selectedOption === index && styles.radioButtonSelected
                        ]} />
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <AnimatedButton
                    title={currentQuestionIndex === quiz.questions.length - 1 ? (isSubmitting ? 'Submitting...' : 'Finish Quiz') : 'Next Question'}
                    onPress={handleNextQuestion}
                    disabled={selectedOption === null}
                    style={[styles.button, selectedOption === null && styles.buttonDisabled]}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#16213e',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a40',
    },
    backButton: {
        marginRight: 15,
    },
    progressContainer: {
        flex: 1,
    },
    progressText: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 5,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#2a2a40',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#667eea',
    },
    content: {
        padding: 20,
    },
    questionText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
        lineHeight: 28,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16213e',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    optionSelected: {
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#666',
        marginRight: 15,
    },
    radioButtonSelected: {
        borderColor: '#667eea',
        backgroundColor: '#667eea',
    },
    optionText: {
        color: '#fff',
        fontSize: 16,
        flex: 1,
    },
    footer: {
        padding: 20,
        backgroundColor: '#16213e',
    },
    button: {
        backgroundColor: '#667eea',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#2a2a40',
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 20,
    },
    resultScore: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: 10,
    },
    resultSubtext: {
        color: '#aaa',
        fontSize: 18,
        marginBottom: 50,
        textAlign: 'center',
    },
});
