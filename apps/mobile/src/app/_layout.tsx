import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Palette } from '@/constants/theme';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { MarathonWidget } from '@/components/marathon-widget';
import { PaywallModal } from '@/components/paywall-modal';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    async function prepare() {
      try {
        await restoreSession();
      } catch {
        // Ignore initialization errors
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, [restoreSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Palette.paper },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)/onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="topic-detail" options={{ headerShown: false }} />
            <Stack.Screen name="files" options={{ headerShown: false }} />
            <Stack.Screen name="quizzes" options={{ headerShown: false }} />
            <Stack.Screen name="mocks" options={{ headerShown: false }} />
            <Stack.Screen name="marathon" options={{ headerShown: false }} />
            <Stack.Screen name="assistant" options={{ headerShown: false }} />
            <Stack.Screen name="planner" options={{ headerShown: false }} />
            <Stack.Screen name="progress" options={{ headerShown: false }} />
            <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
            <Stack.Screen
              name="notifications"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </Stack>

          {/* Floating Pomodoro Marathon Timer */}
          <MarathonWidget />

          {/* Global Scholar Paywall Modal */}
          <PaywallModal />
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
});
