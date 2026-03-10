import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GradientCheckbox } from './gradient-checkbox';
import { lightColors, darkColors, spacing, borderRadius, animation } from '@/constants/design-system';

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

interface SwipeableTaskCardProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onPress?: (task: Task) => void;
}

export const SwipeableTaskCard = memo(({
  task,
  onToggle,
  onDelete,
  onEdit,
  onPress,
}: SwipeableTaskCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(task.isCompleted ? 0.5 : 1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const deleteActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-100, -50, 0],
      [1, 0.5, 0]
    ),
  }));

  const editActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 50, 100],
      [0, 0.5, 1]
    ),
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      const threshold = 80;

      if (event.translationX < -threshold) {
        // Swiped left - delete
        translateX.value = withSpring(-150);
        runOnJS(Haptics.notificationAsync)(
          Haptics.NotificationFeedbackType.Warning
        );
        setTimeout(() => {
          runOnJS(onDelete)(task);
        }, 300);
      } else if (event.translationX > threshold) {
        // Swiped right - edit
        translateX.value = withSpring(150);
        runOnJS(Haptics.impactAsync)(
          Haptics.ImpactFeedbackStyle.Medium
        );
        setTimeout(() => {
          runOnJS(onEdit)(task);
        }, 200);
      } else {
        // Reset
        translateX.value = withSpring(0, animation.spring);
      }
    });

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.98, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  const handleToggle = () => {
    const newValue = !task.isCompleted;
    onToggle(task.id, newValue);
    opacity.value = withTiming(newValue ? 0.5 : 1, { duration: 250 });
  };

  return (
    <View style={styles.container}>
      {/* Delete Action Background */}
      <Animated.View style={[styles.actionBackground, styles.deleteBackground, deleteActionStyle]}>
        <LinearGradient
          colors={[darkColors.actionGradients.delete.start, darkColors.actionGradients.delete.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </LinearGradient>
      </Animated.View>

      {/* Edit Action Background */}
      <Animated.View style={[styles.actionBackground, styles.editBackground, editActionStyle]}>
        <LinearGradient
          colors={[darkColors.actionGradients.edit.start, darkColors.actionGradients.edit.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Edit</Text>
        </LinearGradient>
      </Animated.View>

      {/* Card Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: isDark
                ? darkColors.surface
                : lightColors.surface,
              borderColor: isDark
                ? darkColors.glass.border
                : lightColors.glass.border,
            },
            cardStyle,
          ]}
        >
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress ? () => onPress(task) : undefined}
            style={styles.pressable}
          >
            <View style={styles.content}>
              <GradientCheckbox
                checked={task.isCompleted}
                color={task.category.color}
                onToggle={handleToggle}
              />

              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.title,
                    task.isCompleted && styles.completedTitle,
                    { color: isDark ? darkColors.text.primary : lightColors.text.primary },
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                {task.description && (
                  <Text
                    style={[styles.description, { color: isDark ? darkColors.text.secondary : lightColors.text.secondary }]}
                    numberOfLines={2}
                  >
                    {task.description}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: task.category.color + '20' },
                ]}
              >
                <Text style={[styles.categoryText, { color: task.category.color }]}>
                  {task.category.name}
                </Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

SwipeableTaskCard.displayName = 'SwipeableTaskCard';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  actionBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    zIndex: 0,
  },
  deleteBackground: {
    right: 0,
  },
  editBackground: {
    left: 0,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  pressable: {
    padding: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    lineHeight: 20,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
