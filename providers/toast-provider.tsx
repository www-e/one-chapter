import React from 'react';
import { ToastProvider as LibToastProvider } from 'react-native-toast-notifications';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <LibToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
      successColor="#8AB096"
      dangerColor="#D68A8A"
      normalColor="#6B9B9A"
    >
      {children}
    </LibToastProvider>
  );
}
