import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// 🔌 API URL
const API_URL = 'http://10.162.38.72:5001/api';

export default function ProfileScreen() {
    const { userToken, logout, userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        streak: 0,
        xp: 0,
        lessons: 0,
        rank: '-'
    });

    useEffect(() => {
        fetchProfileStats();
    }, []);

    const fetchProfileStats = async () => {
        try {
            // 1. Get User Rank & Stats
            // In a real app, you might have a dedicated /profile endpoint
            // For now, we'll reuse the rank endpoint or just mock if not available
            console.log('Fetching profile stats for:', userInfo?._id);

            // Example: Fetching rank specific to user
            const response = await axios.get(`${API_URL}/leaderboard/rank/${userInfo?._id}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setStats({
                streak: response.data.streak || 0, // Assuming backend returns this, else 0
                xp: response.data.totalScore || 0,
                lessons: response.data.lessonsCompleted || 0,
                rank: response.data.rank || '-'
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to userInfo from login if API fails
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>👤 My Profile</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <Text style={styles.name}>{userInfo?.name || 'User'}</Text>
                <Text style={styles.email}>{userInfo?.email || 'email@example.com'}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 20 }} />
            ) : (
                <>
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>🔥 {stats.streak}</Text>
                            <Text style={styles.statLabel}>Day Streak</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>✨ {stats.xp}</Text>
                            <Text style={styles.statLabel}>Total XP</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={[styles.statBox, { marginTop: 10, width: '90%' }]}>
                            <Text style={styles.statValue}>📚 {stats.lessons}</Text>
                            <Text style={styles.statLabel}>Lessons Completed</Text>
                        </View>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={[styles.statBox, { marginTop: 10, width: '90%', borderColor: '#667eea' }]}>
                            <Text style={[styles.statValue, { color: '#667eea' }]}>#{stats.rank}</Text>
                            <Text style={styles.statLabel}>Global Rank</Text>
                        </View>
                    </View>
                </>
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
    profileCard: {
        alignItems: 'center',
        padding: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#aaa',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        flexWrap: 'wrap',
    },
    statBox: {
        backgroundColor: '#16213e',
        width: '40%',
        padding: 20,
        borderRadius: 12,
        margin: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffd700',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#aaa',
    },
});
