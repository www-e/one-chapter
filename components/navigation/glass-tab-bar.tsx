import React from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { lightColors, darkColors, spacing, animation } from '@/constants/design-system';

const tabs = [
  { key: 'index', icon: 'checkmark-circle-outline' as const, label: 'Tasks', route: '/(tabs)' },
  { key: 'explore', icon: 'folder-outline' as const, label: 'Categories', route: '/(tabs)/explore' },
  { key: 'stats', icon: 'bar-chart-outline' as const, label: 'Stats', route: '/(tabs)/stats' },
];

export const GlassTabBar = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === '/(tabs)' || pathname === '/') return 'index';
    if (pathname?.includes('/explore')) return 'explore';
    if (pathname?.includes('/stats')) return 'stats';
    return 'index';
  };

  const activeTab = getActiveTab();
  const activeIndex = tabs.findIndex(t => t.key === activeTab);

  // Animated indicator that slides to active tab
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex * (100 / tabs.length) : 0);

  React.useEffect(() => {
    const currentIndex = tabs.findIndex(t => t.key === activeTab);
    if (currentIndex >= 0) {
      indicatorPosition.value = withSpring(currentIndex * (100 / tabs.length), animation.spring);
    }
  }, [activeTab]);

  const handleTabPress = (tab: typeof tabs[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(tab.route as any);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${indicatorPosition.value}%` }],
    width: `${100 / tabs.length}%`,
  }));

  return (
    <BlurView
      intensity={30}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + spacing.sm,
          paddingTop: spacing.md,
          backgroundColor: isDark
            ? darkColors.glass.background
            : lightColors.glass.background,
          borderTopColor: isDark
            ? darkColors.glass.border
            : lightColors.glass.border,
        },
      ]}
    >
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabPress(tab)}
              onPressIn={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={
                    isActive
                      ? isDark
                        ? darkColors.primary
                        : lightColors.primary
                      : isDark
                        ? darkColors.text.tertiary
                        : lightColors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive
                        ? isDark
                          ? darkColors.text.primary
                          : lightColors.text.primary
                        : isDark
                          ? darkColors.text.tertiary
                          : lightColors.text.secondary,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.indicator,
          indicatorStyle,
          {
            backgroundColor: isDark ? darkColors.primary : lightColors.primary,
          },
        ]}
      />
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
  indicator: {
    position: 'absolute',
    bottom: -spacing.sm,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
