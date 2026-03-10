import { PaperProvider } from 'react-native-paper';
import { type ReactNode } from 'react';
import { lightTheme, darkTheme } from '@/constants/paper-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function PaperProviderWrapper({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  );
}
