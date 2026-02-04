import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/AnimatedButton';

// 🔌 API URL
const API_URL = 'http://10.162.38.72:5001/api';

export default function CreatePostScreen({ navigation }) {
    const { userToken } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Missing Fields', 'Please fill in both title and content.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/discussions`, {
                title,
                content,
                lessonId: 'global' // Or select from dropdown
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setLoading(false);
            Alert.alert('Success', 'Discussion created successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error creating post:', error);
            setLoading(false);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Post</Text>
                <View style={{ width: 50 }} />
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#666"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Elaborate on your question..."
                        placeholderTextColor="#666"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <AnimatedButton
                    title={loading ? "Posting..." : "Post"}
                    onPress={handlePost}
                    disabled={loading}
                    style={styles.submitButton}
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
    cancelButton: {
        padding: 5,
        width: 60,
    },
    cancelText: {
        color: '#ff4444',
        fontSize: 16,
    },
    form: {
        padding: 20,
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#16213e',
        borderRadius: 10,
        padding: 15,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    textArea: {
        flex: 1,
        minHeight: 150,
    },
    submitButton: {
        marginBottom: 20,
    }
});
