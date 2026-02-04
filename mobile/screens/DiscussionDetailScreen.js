import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';

// 🔌 API URL
const API_URL = 'http://10.162.38.72:5001/api';

export default function DiscussionDetailScreen({ route, navigation }) {
    const { discussionId } = route.params;
    const { userToken, userInfo } = useContext(AuthContext);

    const [discussion, setDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDiscussionDetails();
    }, []);

    const fetchDiscussionDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/discussions/thread/${discussionId}`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setDiscussion(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching discussion details:', error);
            setError('Could not load discussion. Please check your connection.');
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/discussions/${discussionId}/reply`, {
                content: replyText
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setReplyText('');
            fetchDiscussionDetails();
            setSubmitting(false);
        } catch (error) {
            console.error('Error replying:', error);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={50} color="#ff4444" />
                <Text style={{ color: '#fff', marginTop: 10, marginBottom: 20 }}>{error}</Text>
                <AnimatedButton
                    title="Retry"
                    onPress={fetchDiscussionDetails}
                    style={{ width: 150, height: 45 }}
                />
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#aaa' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Fallback if null (shouldn't happen with error handling, but safe to keep)
    const displayDiscussion = discussion;
    if (!displayDiscussion) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Thread</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Original Post */}
                <View style={styles.mainPost}>
                    <View style={styles.authorRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{displayDiscussion.user?.name?.[0] || '?'}</Text>
                        </View>
                        <View>
                            <Text style={styles.authorName}>{displayDiscussion.user?.name}</Text>
                            <Text style={styles.timestamp}>{new Date(displayDiscussion.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>
                    <Text style={styles.postTitle}>{displayDiscussion.title}</Text>
                    <Text style={styles.postBody}>{displayDiscussion.content}</Text>
                </View>

                {/* Replies Section */}
                <Text style={styles.sectionHeader}>Replies ({displayDiscussion.replies?.length || 0})</Text>

                {displayDiscussion.replies?.map((reply, index) => (
                    <View key={index} style={styles.replyCard}>
                        <View style={styles.authorRow}>
                            <View style={[styles.avatar, styles.smallAvatar]}>
                                <Text style={styles.smallAvatarText}>{reply.user?.name?.[0] || '?'}</Text>
                            </View>
                            <Text style={styles.replyAuthor}>{reply.user?.name}</Text>
                        </View>
                        <Text style={styles.replyBody}>{reply.content}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Reply Input */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a reply..."
                        placeholderTextColor="#888"
                        value={replyText}
                        onChangeText={setReplyText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !replyText.trim() && styles.disabledSend]}
                        onPress={handleReply}
                        disabled={!replyText.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#16213e',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a40',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: 15,
    },
    mainPost: {
        backgroundColor: '#16213e',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    authorName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    timestamp: {
        color: '#888',
        fontSize: 12,
    },
    postTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    postBody: {
        color: '#ddd',
        fontSize: 16,
        lineHeight: 24,
    },
    sectionHeader: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
    },
    replyCard: {
        backgroundColor: '#16213e', // Slightly lighter/darker?
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        marginLeft: 10, // Indent replies
        borderLeftWidth: 3,
        borderLeftColor: '#667eea',
    },
    smallAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    smallAvatarText: {
        fontSize: 12,
    },
    replyAuthor: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    replyBody: {
        color: '#bbb',
        fontSize: 14,
        marginTop: 5,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 15,
        backgroundColor: '#16213e',
        borderTopWidth: 1,
        borderTopColor: '#2a2a40',
    },
    input: {
        flex: 1,
        backgroundColor: '#0f172a',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 12,
        marginRight: 10,
        color: '#fff',
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2, // Align with input text
    },
    disabledSend: {
        backgroundColor: '#2a2a40',
    }
});
