import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from '@/providers/query-provider';
import { PaperProviderWrapper } from '@/providers/paper-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { DatabaseProvider } from '@/providers/DatabaseProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <QueryProvider>
          <PaperProviderWrapper>
            <ToastProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </ToastProvider>
          </PaperProviderWrapper>
        </QueryProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
