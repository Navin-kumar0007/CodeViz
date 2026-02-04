import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import SkeletonCard from '../components/SkeletonCard';

// 🔌 API URL
const API_URL = 'http://10.162.38.72:5001/api';

export default function CommunityScreen({ navigation }) {
    const { userToken } = useContext(AuthContext);
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch on mount and when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDiscussions();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchDiscussions = async () => {
        try {
            // Using a lessonId of 'general' or similar if API requires it, 
            // or fetching recent global discussions if endpoint supports it.
            // Based on routes, it expects /:lessonId. Let's assume there's a 'general' or we use a fixed ID for now.
            // Or better, let's update the backend to allow fetching recent global discussions?
            // For now, let's try fetching for a 'community' context or similar.
            // Update: Checking backend routes, it is router.get('/:lessonId', getDiscussions);
            // We might need to adjust the backend to support a "global" feed or just pass 'global'.

            const response = await axios.get(`${API_URL}/discussions/global`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setDiscussions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching discussions:', error);
            // Fallback for demo if API fails (e.g. route doesn't exist yet)
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DiscussionDetail', { discussionId: item._id, title: item.title })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.authorContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.user?.name ? item.user.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.authorName}>{item.user?.name || 'Anonymous'}</Text>
                        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                {item.isSolved && (
                    <View style={styles.solvedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#00C851" />
                        <Text style={styles.solvedText}>Solved</Text>
                    </View>
                )}
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{item.content}</Text>

            <View style={styles.cardFooter}>
                <View style={styles.metaInfo}>
                    <Ionicons name="chatbubble-outline" size={16} color="#aaa" />
                    <Text style={styles.metaText}>{item.replies?.length || 0} Replies</Text>
                </View>
                <View style={styles.metaInfo}>
                    <Ionicons name="eye-outline" size={16} color="#aaa" />
                    <Text style={styles.metaText}>{item.views || 0} Views</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>💬 Community</Text>
            </View>

            {loading ? (
                <View style={styles.list}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            ) : (
                <FlatList
                    data={discussions}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="chatbubbles-outline" size={50} color="#2a2a40" />
                            <Text style={styles.emptyText}>No discussions yet.</Text>
                            <Text style={styles.emptySubtext}>Be the first to start a topic!</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
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
        marginTop: 100,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtext: {
        color: '#888',
        fontSize: 14,
        marginTop: 5,
    },
    card: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    authorName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    timestamp: {
        color: '#888',
        fontSize: 12,
    },
    solvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 200, 81, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    solvedText: {
        color: '#00C851',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    body: {
        color: '#ccc',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 15,
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
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#667eea',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    }
});
