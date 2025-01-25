//app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
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
        </Stack>
    );
}