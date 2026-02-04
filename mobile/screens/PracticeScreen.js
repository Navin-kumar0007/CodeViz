import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import SkeletonCard from '../components/SkeletonCard';

// 🔌 API URL
const API_URL = 'http://10.162.38.72:5001/api';

export default function PracticeScreen({ navigation }) {
    const { userToken } = useContext(AuthContext);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            console.log('Fetching quizzes...');
            const response = await axios.get(`${API_URL}/quizzes`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setQuizzes(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return '#00C851';
            case 'served': return '#ffbb33'; // medium
            case 'medium': return '#ffbb33';
            case 'hard': return '#ff4444';
            default: return '#33b5e5';
        }
    };

    const renderQuizItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Quiz', { quizId: item._id, title: item.title })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.quizTitle}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                    <Text style={styles.badgeText}>{item.difficulty}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
                {item.description || "No description available."}
            </Text>

            <View style={styles.cardFooter}>
                <View style={styles.metaInfo}>
                    <Ionicons name="help-circle-outline" size={16} color="#aaa" />
                    <Text style={styles.metaText}>{item.questions?.length || 0} Questions</Text>
                </View>
                <View style={styles.metaInfo}>
                    <Ionicons name="people-outline" size={16} color="#aaa" />
                    <Text style={styles.metaText}>{item.timesCompleted || 0} Attempts</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🧠 Practice Arena</Text>
            </View>

            {loading ? (
                <View style={styles.list}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={quizzes}
                    renderItem={renderQuizItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No quizzes available yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        padding: 20,
        backgroundColor: '#16213e',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a40',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    list: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#aaa',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2a2a40',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    quizTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        marginRight: 10,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    description: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 15,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 10,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    metaText: {
        color: '#aaa',
        fontSize: 12,
        marginLeft: 5,
    }
});
