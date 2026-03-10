import React, { memo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, animation } from '@/constants/design-system';

interface GradientFABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  bottom?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GradientFAB = memo(({
  onPress,
  icon = 'add',
  size = 56,
  bottom = 80,
}: GradientFABProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  return (
    <View style={[styles.container, { bottom }]}>
      <AnimatedPressable
        style={[animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={['#6B9B9A', '#8DBFB0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <Ionicons name={icon} size={28} color="#FFFFFF" />
        </LinearGradient>
      </AnimatedPressable>
    </View>
  );
});

GradientFAB.displayName = 'GradientFAB';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 1000,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
