import React, { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { lightColors, darkColors, borderRadius, spacing } from '@/constants/design-system';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  padding?: keyof typeof spacing;
  borderRadius?: keyof typeof borderRadius;
}

export const GlassContainer = memo(({
  children,
  style,
  intensity = 20,
  tint,
  padding = 'lg',
  borderRadius: radius = 'lg',
}: GlassContainerProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const containerStyle = StyleSheet.flatten([
    styles.glass,
    {
      backgroundColor: isDark ? darkColors.glass.background : lightColors.glass.background,
      borderColor: isDark ? darkColors.glass.border : lightColors.glass.border,
      borderRadius: borderRadius[radius],
      padding: spacing[padding],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
    style,
  ]);

  return (
    <BlurView
      intensity={intensity}
      tint={tint || (isDark ? 'dark' : 'light')}
      style={containerStyle}
    >
      {children}
    </BlurView>
  );
});

GlassContainer.displayName = 'GlassContainer';

const styles = StyleSheet.create({
  glass: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
