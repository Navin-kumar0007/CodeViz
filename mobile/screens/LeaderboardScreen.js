import { StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';

// 🔌 API URL
const API_URL = 'http://10.162.38.72:5001/api';

export default function LeaderboardScreen() {
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            console.log('Fetching leaderboard...');
            const response = await axios.get(`${API_URL}/leaderboard`);
            setLeaderboard(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLoading(false);
            setLeaderboard([]);
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.card}>
            <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{item.rank}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userStreak}>📚 {item.lessonsCompleted} lessons completed</Text>
            </View>
            <Text style={styles.xpText}>{item.totalScore} XP</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🏆 Leaderboard</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={leaderboard}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.rank.toString()}
                    contentContainerStyle={styles.list}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    list: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16213e',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rankBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    rankText: {
        color: '#667eea',
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userStreak: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 2,
    },
    xpText: {
        color: '#ffd700',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
