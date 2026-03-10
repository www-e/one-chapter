import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Checkbox } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  onLongPress?: (task: Task) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export const AnimatedTaskItem = memo(({ task, onToggle, onPress, onLongPress, isLoading = false, isDeleting = false }: TaskItemProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(1);
  const opacity = useSharedValue(task.isCompleted ? 0.5 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDeleting ? 0 : opacity.value,
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !task.isCompleted;
    onToggle(task.id, newValue);
    opacity.value = withTiming(newValue ? 0.5 : 1, { duration: 250 });
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        animatedStyle,
        { backgroundColor: isDark ? '#252829' : '#FFFFFF' },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(task)}
      onLongPress={() => onLongPress?.(task)}
      delayLongPress={300}
    >
      <View style={styles.content}>
        <Checkbox
          status={task.isCompleted ? 'checked' : 'unchecked'}
          onPress={handleToggle}
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
    </AnimatedPressable>
  );
});

AnimatedTaskItem.displayName = 'AnimatedTaskItem';

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
