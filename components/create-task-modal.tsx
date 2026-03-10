import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Text, View, Pressable, Modal, ActivityIndicator, useColorScheme } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';

interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

interface CreateTaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: { title: string; description: string | undefined; categoryId: string }) => void;
  categories: Category[];
  isLoading?: boolean;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESC_LENGTH = 500;

export function CreateTaskModal({ visible, onDismiss, categories, onSubmit, isLoading = false }: CreateTaskModalProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [titleError, setTitleError] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setSelectedCategory(categories[0]?.id || '');
      setTitleError('');
    }
  }, [visible, categories]);

  const validateTitle = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setTitleError('Title is required');
      return false;
    }
    if (trimmed.length < 2) {
      setTitleError('Title must be at least 2 characters');
      return false;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateTitle(title)) {
      return;
    }
    if (!selectedCategory) {
      setTitleError('Please select a category');
      return;
    }
    const trimmedDesc = description.trim();
    onSubmit({
      title: title.trim(),
      description: trimmedDesc || undefined,
      categoryId: selectedCategory,
    });
  };

  const isValid = title.trim().length >= 2 && title.length <= MAX_TITLE_LENGTH && selectedCategory && !isLoading;
  const selectedCategoryColor = categories.find(c => c.id === selectedCategory)?.color || colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={handleDismiss}>
          <View style={styles.contentContainer}>
            <Pressable style={styles.modalContent}>
              <View style={[styles.modalBlur, { backgroundColor: colors.surface, borderColor: colors.glass.border }]}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>New Task</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Create a new task</Text>
                  </View>
                  <Pressable onPress={handleDismiss} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.text.secondary} />
                  </Pressable>
                </View>

                {/* Content */}
                <ScrollView contentContainerStyle={styles.content}>
                  {/* Title Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Title</Text>
                    <TextInput
                      value={title}
                      onChangeText={(text) => {
                        setTitle(text.slice(0, MAX_TITLE_LENGTH));
                        if (titleError) validateTitle(text.slice(0, MAX_TITLE_LENGTH));
                      }}
                      onBlur={() => validateTitle(title)}
                      mode="outlined"
                      style={styles.input}
                      error={!!titleError}
                      autoFocus
                      disabled={isLoading}
                      outlineStyle={{ borderRadius: borderRadius.md }}
                      textColor={colors.text.primary}
                    />
                    {titleError ? (
                      <Text style={[styles.errorText, { color: theme.colors.error }]}>{titleError}</Text>
                    ) : (
                      <Text style={[styles.charCount, { color: colors.text.tertiary }]}>{title.length}/{MAX_TITLE_LENGTH}</Text>
                    )}
                  </View>

                  {/* Description Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Description (optional)</Text>
                    <TextInput
                      value={description}
                      onChangeText={(text) => setDescription(text.slice(0, MAX_DESC_LENGTH))}
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      style={styles.input}
                      disabled={isLoading}
                      outlineStyle={{ borderRadius: borderRadius.md }}
                      textColor={colors.text.primary}
                    />
                    <Text style={[styles.charCount, { color: colors.text.tertiary }]}>{description.length}/{MAX_DESC_LENGTH}</Text>
                  </View>

                  {/* Category Selector */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Category</Text>
                    <Pressable
                      onPress={() => setShowCategoryPicker(true)}
                      style={[styles.categorySelector, { borderColor: selectedCategoryColor, backgroundColor: colors.surface }]}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: selectedCategoryColor }]} />
                      <Text style={[styles.categorySelectorText, { color: colors.text.primary }]}>
                        {categories.find(c => c.id === selectedCategory)?.name || 'Select category'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                    </Pressable>
                  </View>
                </ScrollView>

                {/* Actions */}
                <View style={styles.actions}>
                  <Pressable
                    onPress={handleDismiss}
                    disabled={isLoading}
                    style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.text.tertiary + '60' }]}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>Cancel</Text>
                  </Pressable>

                  {!isValid || isLoading ? (
                    <Pressable
                      onPress={handleSubmit}
                      disabled={!isValid || isLoading}
                      style={[styles.button, styles.disabledButton, { backgroundColor: colors.text.tertiary + '60' }]}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={colors.text.tertiary} />
                      ) : (
                        <Text style={[styles.disabledButtonText, { color: colors.text.tertiary }]}>Create</Text>
                      )}
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={handleSubmit}
                      style={[styles.button, styles.saveButton, { backgroundColor: selectedCategoryColor }]}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="add" size={20} color="#FFFFFF" />
                          <Text style={styles.saveButtonText}>Create</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <Pressable style={styles.categoryPickerBackdrop} onPress={() => setShowCategoryPicker(false)}>
            <Pressable style={[styles.categoryPickerContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.categoryPickerHeader, { borderBottomColor: colors.glass.border }]}>
                <Text style={[styles.categoryPickerTitle, { color: colors.text.primary }]}>Select Category</Text>
                <Pressable onPress={() => setShowCategoryPicker(false)} style={styles.categoryPickerClose}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </Pressable>
              </View>
              <View style={styles.categoryOptions}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={[styles.categoryOptionDot, { backgroundColor: category.color }]} />
                    <Text style={[styles.categoryOptionText, { color: colors.text.primary }]}>{category.name}</Text>
                    {selectedCategory === category.id && (
                      <Ionicons name="checkmark-circle" size={20} color={category.color} />
                    )}
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 500,
  },
  modalContent: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalBlur: {
    borderWidth: 1,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...typography.displayMedium,
  },
  headerSubtitle: {
    ...typography.body,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: 'transparent',
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginTop: spacing.sm,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categorySelectorText: {
    ...typography.body,
    flex: 1,
    fontWeight: '500',
  },
  errorText: {
    ...typography.caption,
    color: '#D68A8A',
  },
  charCount: {
    ...typography.caption,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  disabledButton: {},
  disabledButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flex: 1,
    height: '100%',
  },
  saveButtonText: {
    ...typography.bodyLarge,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Category Picker Modal
  categoryPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  categoryPickerContent: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  categoryPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.glass.border,
  },
  categoryPickerTitle: {
    ...typography.headline,
    color: lightColors.text.primary,
    fontWeight: '600',
  },
  categoryPickerClose: {
    padding: spacing.sm,
  },
  categoryOptions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  categoryOptionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  categoryOptionText: {
    ...typography.bodyLarge,
    color: lightColors.text.primary,
    flex: 1,
  },
});
