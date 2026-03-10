import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
  category: Category;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onPress: (task: Task) => void;
}

export const TaskItem = memo(({ task, onToggle, onPress }: TaskItemProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        { backgroundColor: isDark ? '#252829' : '#FFFFFF' },
      ]}
      onPress={() => onPress(task)}
    >
      <View style={styles.content}>
        <Checkbox
          status={task.isCompleted ? 'checked' : 'unchecked'}
          onPress={() => onToggle(task.id, !task.isCompleted)}
          uncheckedColor={task.category.color}
          color={task.category.color}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.isCompleted && styles.completedTitle,
              { color: isDark ? '#E8EBEB' : '#2C3E3D' },
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text
              style={[styles.description, { color: isDark ? '#9BA3A2' : '#6B7B7A' }]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: task.category.color + '20' }]}>
          <Text style={[styles.categoryText, { color: task.category.color }]}>
            {task.category.name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

TaskItem.displayName = 'TaskItem';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
