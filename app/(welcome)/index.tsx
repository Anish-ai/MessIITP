//app/(welcome)/index.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const WelcomeScreen = () => {
    useEffect(() => {
        const checkToken = async () => {
            try {
                // Check if a token exists in AsyncStorage
                const token = await AsyncStorage.getItem('token');

                if (token) {
                    // Token exists, navigate to the Menu screen
                    router.replace('/menu');
                } else {
                    // No token, navigate to the Login screen
                    router.replace('/login');
                }
            } catch (error) {
                console.error('Failed to check token:', error);
                // If there's an error, navigate to the Login screen as a fallback
                router.replace('/login');
            }
        };

        checkToken();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007BFF" />
        </View>
    );
};

export default WelcomeScreen;