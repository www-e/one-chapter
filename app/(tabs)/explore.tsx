import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, useColorScheme, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { categoryService, taskService } from '@/lib/services';
import { useToast } from 'react-native-toast-notifications';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';
import { CreateCategoryModal } from '@/components/create-category-modal';
import { GradientFAB } from '@/components/ui';
import { EmptyState, LoadingState } from '@/components/common';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

// Separate component to avoid hooks violation
function CategoryCard({ item, index, colors, isDark, refreshTrigger }: { item: Category & { taskCount?: number }; index: number; colors: any; isDark: boolean; refreshTrigger: number }) {
  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);

  const chevronRotation = useSharedValue(0);
  const heightAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(1);

  const loadTasksForCategory = useCallback(async (forceRefresh = false) => {
    if (expanded) {
      setLoadingTasks(true);
      try {
        const categoryTasks = await taskService.getByCategory(item.id);
        setTasks(categoryTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoadingTasks(false);
      }
    }
  }, [expanded, item.id]);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 400 });
    slideAnim.value = withTiming(0, { duration: 400 });
  }, []);

  useEffect(() => {
    if (expanded) {
      chevronRotation.value = withTiming(1, { duration: 300 });
      heightAnim.value = withTiming(1, { duration: 300 });
      opacityAnim.value = withTiming(1, { duration: 300 });
      loadTasksForCategory();
    } else {
      chevronRotation.value = withTiming(0, { duration: 300 });
      heightAnim.value = withTiming(0, { duration: 300 });
      opacityAnim.value = withTiming(0, { duration: 200 });
    }
  }, [expanded, loadTasksForCategory]);

  // Reload tasks when refreshTrigger changes and category is expanded
  useEffect(() => {
    if (expanded) {
      loadTasksForCategory();
    }
  }, [refreshTrigger, expanded, loadTasksForCategory]);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 400 });
    slideAnim.value = withTiming(0, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value * 90}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => {
    const estimatedHeight = Math.max(tasks.length * 60 + 20, 80); // Minimum height for empty state
    return {
      height: heightAnim.value * estimatedHeight,
      opacity: opacityAnim.value,
    };
  });

  const pressInStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handlePressIn = () => {
    scaleAnim.value = withTiming(0.97, { duration: 150 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withTiming(1, { duration: 150 });
  };

  const handleCardPress = () => {
    setExpanded(!expanded);
  };

  const handleToggleTask = async (taskId: string) => {
    setTogglingTask(taskId);
    try {
      await taskService.toggleComplete(taskId);
      // Update local state
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setTogglingTask(null);
    }
  };

  const taskCount = item.taskCount || item._count?.tasks || 0;

  return (
    <AnimatedPressable
      onPress={handleCardPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, pressInStyle]}
    >
      <View style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.glass.border }]}>
        {/* Gradient Header */}
        <LinearGradient
          colors={[item.color, item.color + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryHeader}
        >
          <View style={styles.categoryHeaderContent}>
            <View style={[styles.categoryIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="folder" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryCount}>
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </Text>
            </View>
          </View>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
          </Animated.View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={[styles.statsRow, { backgroundColor: colors.background }]}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: item.color }]} />
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Active</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: item.color + '30' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: item.color,
                    width: `${Math.min(taskCount * 10, 100)}%`
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Expanded Tasks */}
        <Animated.View style={[styles.expandedContent, contentStyle]}>
          {(expanded || tasks.length > 0) && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {loadingTasks ? (
                <View style={styles.loadingTasks}>
                  <ActivityIndicator size="small" color={item.color} />
                </View>
              ) : tasks.length === 0 ? (
                <View style={styles.noTasks}>
                  <Text style={[styles.noTasksText, { color: colors.text.tertiary }]}>
                    No tasks in this category
                  </Text>
                </View>
              ) : (
                <View style={styles.tasksList}>
                  {tasks.map((task) => (
                    <Pressable
                      key={task.id}
                      onPress={() => handleToggleTask(task.id)}
                      disabled={togglingTask === task.id}
                      style={({ pressed }) => [
                        styles.compactTaskCard,
                        { backgroundColor: colors.background, borderColor: colors.glass.border },
                        pressed && styles.compactTaskCardPressed,
                      ]}
                    >
                      <View style={[styles.taskCheckbox, { backgroundColor: task.isCompleted ? item.color : 'transparent', borderColor: item.color }]}>
                        {task.isCompleted && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <View style={styles.taskContent}>
                        <Text style={[styles.taskTitle, { color: task.isCompleted ? colors.text.tertiary : colors.text.primary }]} numberOfLines={1}>
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text style={[styles.taskDescription, { color: colors.text.tertiary }]} numberOfLines={1}>
                            {task.description}
                          </Text>
                        )}
                      </View>
                      {togglingTask === task.id && (
                        <ActivityIndicator size="small" color={item.color} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreateCategoryModalVisible, setCreateCategoryModalVisible] = useState(false);

  const headerAnim = useSharedValue(0);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(headerAnim.value, [0, 1], [0, 1]),
    transform: [{ translateY: interpolate(headerAnim.value, [0, 1], [-20, 0]) }],
  }));

  useFocusEffect(
    useCallback(() => {
      // Trigger refresh of expanded categories when screen comes into focus
      setRefreshTrigger(prev => prev + 1);
    }, [])
  );

  useEffect(() => {
    loadCategories();
    headerAnim.value = withTiming(1, { duration: 600 });
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesWithCounts = await categoryService.getAllWithCounts();
      setCategories(categoriesWithCounts as any);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (data: { name: string; color: string }) => {
    try {
      await categoryService.create(data);
      toast.show('Category created successfully!', { type: 'success' });
      setCreateCategoryModalVisible(false);
      await loadCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.show('Failed to create category', { type: 'danger' });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState message="Loading categories..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Categories</Text>
          <Pressable
            onPress={() => {
              // Navigate to main tab and show swipe hint
              router.push('/(tabs)');
              setTimeout(() => {
                // This will be handled by the main tab
              }, 300);
            }}
            style={[styles.helpButton, { backgroundColor: colors.primary + '20' }]}
          >
            <Ionicons name="help-circle" size={24} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Organize your tasks by category</Text>
      </Animated.View>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <CategoryCard item={{ ...item, taskCount: (item as any).taskCount || item._count?.tasks || 0 }} index={index} colors={colors} isDark={isDark} refreshTrigger={refreshTrigger} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing['2xl'] }
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Empty State */}
      {categories.length === 0 && (
        <EmptyState
          icon="folder-outline"
          title="No Categories"
          subtitle="Create categories to organize your tasks"
        />
      )}

      {/* Create Category FAB */}
      <GradientFAB
        onPress={() => setCreateCategoryModalVisible(true)}
        icon="add"
        bottom={insets.bottom + 80}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        visible={isCreateCategoryModalVisible}
        onDismiss={() => setCreateCategoryModalVisible(false)}
        onSubmit={handleCreateCategory}
        isLoading={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.displayMedium,
  },
  headerSubtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  categoryCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.headline,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryCount: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 70,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    ...typography.caption,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  expandedContent: {
    maxHeight: 400,
  },
  scrollView: {
    overflow: 'hidden',
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingTasks: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noTasks: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noTasksText: {
    ...typography.body,
    fontStyle: 'italic',
  },
  tasksList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  compactTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  compactTaskCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    ...typography.body,
    fontWeight: '500',
  },
  taskDescription: {
    ...typography.caption,
  },
});
