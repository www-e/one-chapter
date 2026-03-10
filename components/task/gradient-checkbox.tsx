import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { animation } from '@/constants/design-system';

interface GradientCheckboxProps {
  checked: boolean;
  color: string;
  size?: number;
  onToggle: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GradientCheckbox = memo(({
  checked,
  color,
  size = 28,
  onToggle,
}: GradientCheckboxProps) => {
  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(checked ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.9, animation.spring);
    setTimeout(() => {
      scale.value = withSpring(1, animation.spring);
    }, 50);

    if (!checked) {
      checkmarkScale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });
    } else {
      checkmarkScale.value = withTiming(0, { duration: 150 });
    }

    runOnJS(onToggle)();
  };

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 3 },
        animatedStyle,
      ]}
      onPress={handlePress}
    >
      {checked ? (
        <LinearGradient
          colors={[color, adjustColor(color, 20)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.checkbox,
            {
              width: size,
              height: size,
              borderRadius: size / 3,
            },
          ]}
        >
          <Animated.View style={checkmarkStyle}>
            <Ionicons name="checkmark" size={size * 0.6} color="#FFFFFF" />
          </Animated.View>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.checkbox,
            styles.unchecked,
            {
              width: size,
              height: size,
              borderRadius: size / 3,
              borderColor: color,
              borderWidth: 2,
            },
          ]}
        />
      )}
    </AnimatedPressable>
  );
});

GradientCheckbox.displayName = 'GradientCheckbox';

// Helper function to lighten color
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  unchecked: {
    backgroundColor: 'transparent',
  },
});
