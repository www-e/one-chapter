import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { taskService, categoryService } from '@/lib/services';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';
import { EmptyState, LoadingState } from '@/components/common';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    pending: number;
    byCategory: { id: string; name: string; color: string; count: number; completed: number }[];
  }>({
    total: 0,
    completed: 0,
    pending: 0,
    byCategory: [],
  });

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  // Refresh stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
      fadeAnim.value = withTiming(1, { duration: 600 });
      slideAnim.value = withTiming(0, { duration: 600 });
    }, [])
  );

  const loadStats = async () => {
    try {
      const allTasks = await taskService.getAll();
      const categories = await categoryService.getAll();

      const completed = allTasks.filter((t: any) => t.isCompleted).length;
      const byCategory = await Promise.all(
        categories.map(async (cat: any) => {
          const tasks = await taskService.getByCategory(cat.id);
          return {
            id: cat.id, // Add unique ID to prevent duplicate key warnings
            name: cat.name,
            color: cat.color,
            count: tasks.length,
            completed: tasks.filter((t: any) => t.isCompleted).length,
          };
        })
      );

      setStats({
        total: allTasks.length,
        completed,
        pending: allTasks.length - completed,
        byCategory,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState message="Loading stats..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing['2xl'] }}>
        <Animated.View style={containerStyle}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.primaryGradient.start, colors.primaryGradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIcon}
            >
              <Ionicons name="bar-chart" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Statistics</Text>
              <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Your productivity insights</Text>
            </View>
          </View>

          {/* Completion Rate Card */}
          <View style={styles.cardContainer}>
            <View style={[styles.completionCard, { backgroundColor: colors.surface, borderColor: colors.glass.border, borderWidth: 1 }]}>
              <LinearGradient
                colors={[colors.primaryGradient.start, colors.primaryGradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.completionContent}
              >
                <View>
                  <Text style={styles.completionLabel}>Completion Rate</Text>
                  <Text style={styles.completionValue}>{completionRate}%</Text>
                </View>
                <View style={styles.completionIcon}>
                  <Ionicons name="trending-up" size={48} color="rgba(255,255,255,0.3)" />
                </View>
              </LinearGradient>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
              </View>
            </View>
          </View>

          {/* Quick Stats - Fixed overflow with proper flex */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStats}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.glass.border, borderWidth: 1 }]}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="list" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.total}</Text>
                    <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Total Tasks</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.glass.border, borderWidth: 1 }]}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#8AB09620' }]}>
                    <Ionicons name="checkmark-circle" size={24} color="#8AB096" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.completed}</Text>
                    <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Completed</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.glass.border, borderWidth: 1 }]}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#D68A8A20' }]}>
                    <Ionicons name="time" size={24} color="#D68A8A" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statValue, { color: colors.text.primary }]}>{stats.pending}</Text>
                    <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Pending</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Category Breakdown */}
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>By Category</Text>
          {stats.byCategory.map((category) => {
            const rate = category.count > 0 ? Math.round((category.completed / category.count) * 100) : 0;
            return (
              <View
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.glass.border, borderWidth: 1 }]}
              >
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={[styles.categoryName, { color: colors.text.primary }]}>{category.name}</Text>
                  <Text style={[styles.categoryCount, { color: colors.text.secondary }]}>
                    {category.completed}/{category.count}
                  </Text>
                </View>
                <View style={styles.categoryProgress}>
                  <View style={[styles.categoryProgressBg, { backgroundColor: category.color + '20' }]}>
                    <View style={[styles.categoryProgressFill, { width: `${rate}%`, backgroundColor: category.color }]} />
                  </View>
                  <Text style={[styles.categoryRate, { color: colors.text.secondary }]}>{rate}%</Text>
                </View>
              </View>
            );
          })}

          {/* Empty State */}
          {stats.byCategory.length === 0 && (
            <EmptyState
              icon="stats-chart-outline"
              title="No Data Yet"
              subtitle="Complete some tasks to see your statistics"
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...typography.displayMedium,
  },
  headerSubtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  cardContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  completionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  completionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.xl,
    marginLeft: -spacing.xl,
    marginRight: -spacing.xl,
    marginTop: -spacing.xl,
  },
  completionLabel: {
    ...typography.bodyLarge,
    color: 'rgba(255,255,255,0.9)',
  },
  completionValue: {
    ...typography.displayLarge,
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  completionIcon: {
    opacity: 0.3,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.full,
  },
  quickStatsContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...typography.headline,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.headline,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    ...typography.bodyLarge,
    marginLeft: spacing.sm,
    flex: 1,
    fontWeight: '600',
  },
  categoryCount: {
    ...typography.body,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryProgressBg: {
    flex: 1,
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
  },
  categoryRate: {
    ...typography.caption,
    minWidth: 40,
    textAlign: 'right',
  },
});
