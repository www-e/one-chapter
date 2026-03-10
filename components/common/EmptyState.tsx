/**
 * Reusable Empty State Component
 * Displays when a list or section has no data
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';

export interface EmptyStateProps {
  /** Icon name from Ionicons */
  icon: string;
  /** Title text */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional custom gradient colors */
  gradientColors?: [string, string];
}

/**
 * Reusable empty state component with gradient icon
 *
 * @example
 * <EmptyState
 *   icon="checkbox-outline"
 *   title="No tasks yet"
 *   subtitle="Tap the + button to create your first task"
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  gradientColors,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const defaultGradient: [string, string] = [
    colors.primary + '40',
    colors.secondary + '40',
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors || defaultGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.icon}
      >
        <Ionicons name={icon as any} size={64} color={colors.primary} />
      </LinearGradient>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          {subtitle}
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
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headline,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
});
