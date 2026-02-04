import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function AnimatedButton({ onPress, title, style, textStyle, disabled, children }) {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        if (disabled) return;
        Haptics.selectionAsync(); // Light haptic feedback
        onPress && onPress();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handlePress}
                activeOpacity={0.9}
                disabled={disabled}
                style={[styles.button, disabled && styles.disabled, style]}
            >
                {children ? children : (
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#667eea',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    disabled: {
        backgroundColor: '#2a2a40',
        shadowOpacity: 0,
        elevation: 0,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
