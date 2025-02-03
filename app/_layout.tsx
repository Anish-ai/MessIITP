//app/_layout.tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/hooks/ThemeContext';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function RootLayout() {
    useEffect(() => {
        const requestPermission = async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('You need to enable notifications to use this app.');
            }
        };

        requestPermission();
    }, []);
    return (
        <ThemeProvider>
            <Stack>
                <Stack.Screen
                    name="(welcome)"
                    options={{ headerShown: false }} // Hide the header for the Welcome Screen
                />
                <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                <Stack.Screen name="menu/index" options={{ title: 'Menu', headerShown: false }} />
                <Stack.Screen name="rating/index" options={{ title: 'Rate Meal', headerShown: false }} />
                <Stack.Screen name="history/index" options={{ title: 'Rating History', headerShown: false }} />
                <Stack.Screen name="settings/AdminSettings" options={{ title: 'Settings', headerShown: false }} />
                <Stack.Screen name="settings/CRSettings" options={{ title: 'Settings', headerShown: false }} />
                <Stack.Screen name="settings/UserSettings" options={{ title: 'Settings', headerShown: false }} />
                <Stack.Screen name="settings/ChangeMenuPage" options={{ title: 'Change Menu', headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}