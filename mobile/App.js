import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { useContext, useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import { AuthContext, AuthProvider } from './context/AuthContext';

const Tab = createBottomTabNavigator();

import { createStackNavigator } from '@react-navigation/stack';
import PracticeScreen from './screens/PracticeScreen';
import QuizScreen from './screens/QuizScreen';
import CommunityScreen from './screens/CommunityScreen';
import DiscussionDetailScreen from './screens/DiscussionDetailScreen';
import CreatePostScreen from './screens/CreatePostScreen';

const Stack = createStackNavigator();

function PracticeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PracticeList" component={PracticeScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
        </Stack.Navigator>
    );
}

function CommunityStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CommunityList" component={CommunityScreen} />
            <Stack.Screen name="DiscussionDetail" component={DiscussionDetailScreen} />
            <Stack.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{ presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
}

function AppNavigation() {
    const { isLoading, userToken } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    // Hide splash screen when ready
    useEffect(() => {
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            {userToken ? (
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: '#16213e',
                            borderTopColor: '#2a2a40',
                            height: 60,
                            paddingBottom: 5,
                        },
                        tabBarActiveTintColor: '#667eea',
                        tabBarInactiveTintColor: '#888',
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;
                            if (route.name === 'Leaderboard') {
                                iconName = focused ? 'trophy' : 'trophy-outline';
                            } else if (route.name === 'Practice') {
                                iconName = focused ? 'school' : 'school-outline';
                            } else if (route.name === 'Community') {
                                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                            } else if (route.name === 'Profile') {
                                iconName = focused ? 'person' : 'person-outline';
                            }
                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                    })}
                >
                    <Tab.Screen name="Practice" component={PracticeStack} />
                    <Tab.Screen name="Community" component={CommunityStack} />
                    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
                    <Tab.Screen name="Profile" component={ProfileScreen} />
                </Tab.Navigator>
            ) : (
                <LoginScreen />
            )}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppNavigation />
        </AuthProvider>
    );
}
