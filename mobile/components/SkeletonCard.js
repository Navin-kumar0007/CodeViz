import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonCard() {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Animated.View style={[styles.title, { opacity }]} />
                <Animated.View style={[styles.badge, { opacity }]} />
            </View>
            <Animated.View style={[styles.desc, { opacity }]} />
            <Animated.View style={[styles.desc, { opacity, width: '60%' }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#16213e',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    title: {
        width: '60%',
        height: 20,
        backgroundColor: '#2a2a40',
        borderRadius: 4,
    },
    badge: {
        width: 60,
        height: 20,
        backgroundColor: '#2a2a40',
        borderRadius: 10,
    },
    desc: {
        width: '100%',
        height: 12,
        backgroundColor: '#2a2a40',
        borderRadius: 4,
        marginBottom: 8,
    }
});
