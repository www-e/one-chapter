import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ActivityIndicator, useColorScheme } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';

// Predefined color palette for categories
const CATEGORY_COLORS = [
  '#6B9B9A', // Primary teal
  '#8DBFB0', // Secondary teal
  '#8AB096', // Success green
  '#E5C07B', // Warning yellow
  '#D68A8A', // Error red
  '#9B7BB9', // Purple
  '#B98B6B', // Brown
  '#6B9BB9', // Blue
  '#B96B9B', // Pink
  '#9BB96B', // Lime
  '#FF6B6B', // Coral red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky blue
  '#96CEB4', // Sage
  '#FFEAA7', // Soft yellow
  '#DFE6E9', // Light gray
  '#6C5CE7', // Deep purple
  '#A29BFE', // Light purple
  '#FD79A8', // Pink rose
  '#FDCB6E', // Orange
];

interface CreateCategoryModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: { name: string; color: string }) => void;
  isLoading?: boolean;
}

const MAX_NAME_LENGTH = 30;

export function CreateCategoryModal({ visible, onDismiss, onSubmit, isLoading = false }: CreateCategoryModalProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [nameError, setNameError] = useState('');

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setName('');
      setSelectedColor(CATEGORY_COLORS[0]);
      setNameError('');
    }
  }, [visible]);

  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setNameError('Category name is required');
      return false;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setNameError(`Name must be less than ${MAX_NAME_LENGTH} characters`);
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateName(name)) {
      return;
    }
    onSubmit({
      name: name.trim(),
      color: selectedColor,
    });
  };

  const isValid = name.trim().length >= 2 && name.length <= MAX_NAME_LENGTH && !isLoading;

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
                    <Ionicons name="folder" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>New Category</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Create a new category</Text>
                  </View>
                  <Pressable onPress={handleDismiss} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.text.secondary} />
                  </Pressable>
                </View>

                {/* Content */}
                <ScrollView contentContainerStyle={styles.content}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Category Name</Text>
                    <TextInput
                      value={name}
                      onChangeText={(text) => {
                        setName(text.slice(0, MAX_NAME_LENGTH));
                        if (nameError) validateName(text.slice(0, MAX_NAME_LENGTH));
                      }}
                      onBlur={() => validateName(name)}
                      mode="outlined"
                      style={styles.input}
                      error={!!nameError}
                      autoFocus
                      disabled={isLoading}
                      outlineStyle={{ borderRadius: borderRadius.md }}
                      textColor={colors.text.primary}
                      placeholder="e.g., Work, Personal, Shopping"
                      placeholderTextColor={colors.text.tertiary}
                    />
                    {nameError ? (
                      <Text style={[styles.errorText, { color: theme.colors.error }]}>{nameError}</Text>
                    ) : (
                      <Text style={[styles.charCount, { color: colors.text.tertiary }]}>{name.length}/{MAX_NAME_LENGTH}</Text>
                    )}
                  </View>

                  {/* Color Picker */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Choose Color</Text>
                    <View style={styles.colorGrid}>
                      {CATEGORY_COLORS.map((color) => (
                        <Pressable
                          key={color}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedColor(color);
                          }}
                          style={[
                            styles.colorOption,
                            selectedColor === color && styles.colorOptionSelected,
                            { backgroundColor: color },
                          ]}
                        >
                          {selectedColor === color && (
                            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Preview */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.text.primary }]}>Preview</Text>
                    <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.glass.border }]}>
                      <LinearGradient
                        colors={[selectedColor, selectedColor + 'CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.previewHeader}
                      >
                        <View style={[styles.previewIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <Ionicons name="folder" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.previewInfo}>
                          <Text style={styles.previewName}>
                            {name.trim() || 'Category Name'}
                          </Text>
                          <Text style={styles.previewCount}>0 tasks</Text>
                        </View>
                      </LinearGradient>
                    </View>
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
                      style={[styles.button, styles.saveButton, { backgroundColor: selectedColor }]}
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
      </View>
    </Modal>
  );
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
    maxHeight: '80%',
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
  errorText: {
    ...typography.caption,
    color: '#D68A8A',
  },
  charCount: {
    ...typography.caption,
    textAlign: 'right',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  previewCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  previewHeader: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    ...typography.headline,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  previewCount: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
    flexDirection: 'row',
    gap: spacing.sm,
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
  saveButton: {},
  saveButtonText: {
    ...typography.bodyLarge,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
