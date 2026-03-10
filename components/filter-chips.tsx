import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Text, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/stores/use-task-store';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

interface CategoryDropdownProps {
  categories: Category[];
  onOpenPicker: () => void;
}

export const CategoryDropdown = memo(({ categories, onOpenPicker }: CategoryDropdownProps) => {
  const { selectedCategoryId } = useTaskStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Find selected category
  const selectedCategory = selectedCategoryId
    ? categories.find(c => c.id === selectedCategoryId)
    : null;

  const displayName = selectedCategory?.name || 'All Categories';
  const displayColor = selectedCategory?.color || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.glass.border }]}>
      <Pressable
        onPress={onOpenPicker}
        style={({ pressed }) => [
          styles.dropdown,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.colorDot, { backgroundColor: displayColor }]} />
        <Text style={[styles.dropdownText, { color: colors.text.primary }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </Pressable>
    </View>
  );
});

CategoryDropdown.displayName = 'CategoryDropdown';

export const FilterChips = memo(({ categories }: { categories: Category[] }) => {
  const { selectedCategoryId, setSelectedCategoryId } = useTaskStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const handleChipPress = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  const allOption = { id: 'all', name: 'All', color: colors.primary } as const;
  const allCategories = [allOption, ...categories];

  return (
    <View style={[styles.chipsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.glass.border }]}>
      <View style={styles.chipsScrollContent}>
        {allCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const isAll = category.id === 'all';

          return (
            <Pressable
              key={category.id}
              onPress={() => handleChipPress(isAll ? null : category.id)}
              style={({ pressed }) => [
                styles.chip,
                pressed && styles.chipPressed,
              ]}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[category.color, adjustColor(category.color, 20)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.chipGradient, { borderRadius: borderRadius.full }]}
                >
                  <Text style={styles.chipTextSelected}>
                    {category.name}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={[styles.chipOutline, { borderColor: category.color, backgroundColor: isDark ? colors.background : 'rgba(255,255,255,0.5)' }]}>
                  <Text style={[styles.chipText, { color: category.color }]}>
                    {category.name}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

FilterChips.displayName = 'FilterChips';

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
    borderBottomWidth: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropdownText: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  chipsContainer: {
    borderBottomWidth: 1,
  },
  chipsScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    marginRight: spacing.sm,
  },
  chipPressed: {
    transform: [{ scale: 0.95 }],
  },
  chipGradient: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chipOutline: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipText: {
    ...typography.body,
    fontWeight: '500',
  },
  chipTextSelected: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
