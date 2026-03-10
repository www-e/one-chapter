/**
 * Reusable Loading State Component
 * Displays loading indicator with optional message
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { lightColors, darkColors, spacing, typography } from '@/constants/design-system';

export interface LoadingStateProps {
  /** Optional custom loading message */
  message?: string;
  /** Size of the activity indicator */
  size?: 'small' | 'large';
}

/**
 * Reusable loading state component
 *
 * @example
 * <LoadingState message="Loading tasks..." />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.text.secondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 200,
  },
  message: {
    ...typography.body,
    marginTop: spacing.md,
  },
});
