import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Modal, Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { taskService, categoryService } from '@/lib/services';
import { useTaskStore } from '@/stores/use-task-store';
import { SwipeableTaskCard } from '@/components/task';
import { FilterChips, CategoryDropdown } from '@/components/filter-chips';
import { GradientFAB } from '@/components/ui';
import { CreateTaskModal } from '@/components/create-task-modal';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { EditTaskModal } from '@/components/edit-task-modal';
import { SwipeHintModal, hasSeenSwipeHint } from '@/components/swipe-hint-modal';
import { EmptyState, LoadingState } from '@/components/common';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';

// Type aliases for components
type Task = {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
  category: Category;
};

type Category = {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
};

export default function HomeScreen() {
  const theme = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const { selectedCategoryId, setCreateModalVisible, isCreateModalVisible, setSelectedCategoryId } = useTaskStore();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Local state for categories and ALL tasks (for instant filtering)
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true); // Always show on app open

  // Load categories (once)
  const loadCategories = useCallback(async () => {
    try {
      const categoryModels = await categoryService.getAll();
      const categoriesWithCounts = await Promise.all(
        categoryModels.map(async (cat: any) => {
          const count = await categoryService.getTaskCount(cat.id);
          return {
            id: cat.id,
            name: cat.name,
            color: cat.color,
            _count: { tasks: count },
          };
        })
      );
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.show('Failed to load categories', { type: 'danger' });
    }
  }, []);

  // Load all tasks (once, then filter locally for instant results)
  const loadAllTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const taskModels = await taskService.getAll();

      // Load all categories once (avoid N+1 query pattern)
      const allCategories = await categoryService.getAll();
      const categoryMap = new Map(allCategories.map(cat => [cat.id, cat]));

      // Hydrate tasks with category data (O(1) lookup instead of N queries)
      const tasksWithCategories: Task[] = taskModels.map((taskModel: any) => {
        const category = categoryMap.get(taskModel.categoryId);

        const categoryData: Category = category
          ? {
              id: category.id,
              name: category.name,
              color: category.color,
            }
          : {
              id: taskModel.categoryId,
              name: 'Unknown',
              color: '#6B9B9A',
            };

        return {
          id: taskModel.id,
          title: taskModel.title,
          description: taskModel.description || null,
          isCompleted: taskModel.isCompleted,
          categoryId: taskModel.categoryId,
          createdAt: taskModel.createdAt,
          updatedAt: taskModel.updatedAt,
          category: categoryData,
        };
      });

      setAllTasks(tasksWithCategories);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.show('Failed to load tasks', { type: 'danger' });
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadCategories();
    loadAllTasks();
    checkSwipeHint();
  }, []);

  // Check if swipe hint should be shown
  const checkSwipeHint = async () => {
    const seen = await hasSeenSwipeHint();
    if (!seen) {
      // Show hint after a short delay
      setTimeout(() => setShowSwipeHint(true), 1000);
    }
  };

  // Filter tasks instantly based on selected category (no API call!)
  const filteredTasks = useMemo(() => {
    if (!selectedCategoryId) {
      return allTasks;
    }
    return allTasks.filter(task => task.categoryId === selectedCategoryId);
  }, [allTasks, selectedCategoryId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCategories();
    await loadAllTasks();
    setIsRefreshing(false);
  };

  const handleCreateTask = async (data: { title: string; description: string | undefined; categoryId: string }) => {
    try {
      await taskService.create(data);
      toast.show('Task created successfully', { type: 'success' });
      await loadAllTasks();
      await loadCategories();
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.show('Failed to create task', { type: 'danger' });
    }
  };

  const handleToggleTask = async (id: string, isCompleted: boolean) => {
    try {
      await taskService.toggleComplete(id);
      await loadAllTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toast.show('Failed to update task', { type: 'danger' });
    }
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        await taskService.delete(taskToDelete.id);
        toast.show('Task deleted', { type: 'success' });
        await loadAllTasks();
        await loadCategories();
        setTaskToDelete(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.show('Failed to delete task', { type: 'danger' });
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
  };

  const handleUpdateTask = async (data: { id: string; title: string; description: string | undefined; categoryId: string }) => {
    try {
      await taskService.update(data.id, {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
      });
      toast.show('Task updated successfully', { type: 'success' });
      await loadAllTasks();
      await loadCategories();
      setTaskToEdit(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.show('Failed to update task', { type: 'danger' });
    }
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="checkbox-outline"
      title="No tasks yet"
      subtitle="Tap the + button to create your first task"
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <LoadingState message="Loading tasks..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* Header with Help Button */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>My Tasks</Text>
        <Pressable
          onPress={() => setShowSwipeHint(true)}
          style={[styles.helpButton, { backgroundColor: colors.primary + '20' }]}
        >
          <Ionicons name="help-circle" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Category Dropdown */}
      <CategoryDropdown
        categories={categories}
        onOpenPicker={() => setShowCategoryPicker(true)}
      />

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableTaskCard
            task={item}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
          />
        )}
        contentContainerStyle={filteredTasks.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />

      <GradientFAB
        onPress={() => setCreateModalVisible(true)}
        bottom={insets.bottom + 80}
      />

      {categories && (
        <CreateTaskModal
          visible={isCreateModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          onSubmit={handleCreateTask}
          categories={categories}
          isLoading={false}
        />
      )}

      <DeleteConfirmDialog
        visible={!!taskToDelete}
        onDismiss={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        taskTitle={taskToDelete?.title || ''}
        isLoading={false}
      />

      {categories && taskToEdit && (
        <EditTaskModal
          visible={!!taskToEdit}
          onDismiss={() => setTaskToEdit(null)}
          onSubmit={handleUpdateTask}
          categories={categories}
          task={taskToEdit}
          isLoading={false}
        />
      )}

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowCategoryPicker(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.glass.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Select Category</Text>
              <Pressable onPress={() => setShowCategoryPicker(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </Pressable>
            </View>
            <View style={styles.modalOptions}>
              <Pressable
                style={styles.modalOption}
                onPress={() => {
                  setSelectedCategoryId(null);
                  setShowCategoryPicker(false);
                }}
              >
                <View style={[styles.modalOptionDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.modalOptionText, { color: colors.text.primary }]}>All Categories</Text>
                {!selectedCategoryId && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <View style={[styles.modalOptionDot, { backgroundColor: category.color }]} />
                  <Text style={[styles.modalOptionText, { color: colors.text.primary }]}>{category.name}</Text>
                  {selectedCategoryId === category.id && (
                    <Ionicons name="checkmark" size={20} color={category.color} />
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Swipe Hint Modal */}
      <SwipeHintModal
        visible={showSwipeHint}
        onDismiss={() => setShowSwipeHint(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.displayMedium,
    fontWeight: '700',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  // Category Picker Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...typography.headline,
    fontWeight: '600',
  },
  modalClose: {
    padding: spacing.sm,
  },
  modalOptions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  modalOptionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  modalOptionText: {
    ...typography.body,
    flex: 1,
  },
});
