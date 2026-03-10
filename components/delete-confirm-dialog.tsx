import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';

interface DeleteConfirmDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  taskTitle: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  visible,
  onDismiss,
  onConfirm,
  taskTitle,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const handleConfirm = () => {
    if (!isLoading) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onConfirm();
    }
  };

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
                {/* Warning Icon */}
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#D68A8A', '#E8A0A0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientIcon}
                  >
                    <Ionicons name="trash-outline" size={32} color="#FFFFFF" />
                  </LinearGradient>
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: colors.text.primary }]}>Delete Task?</Text>

                {/* Message */}
                <Text style={[styles.message, { color: colors.text.secondary }]}>
                  Are you sure you want to delete{' '}
                  <Text style={[styles.taskTitle, { color: colors.text.primary }]}>&ldquo;{taskTitle}&rdquo;</Text>?
                </Text>

                <Text style={[styles.warning, { color: colors.text.tertiary }]}>
                  This action cannot be undone.
                </Text>

                {/* Actions */}
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.text.tertiary + '60' }]}
                    onPress={handleDismiss}
                    disabled={isLoading}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.button, styles.deleteButton, { backgroundColor: '#D68A8A' }]}
                    onPress={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.deleteButtonText}>Deleting...</Text>
                    ) : (
                      <>
                        <Ionicons name="trash" size={20} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </>
                    )}
                  </Pressable>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    width: '85%',
    maxWidth: 400,
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
    padding: spacing.xl,
    borderWidth: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  gradientIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    ...typography.displayMedium,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  taskTitle: {
    fontWeight: '600',
  },
  warning: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  deleteButton: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  deleteGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  deleteButtonText: {
    ...typography.bodyLarge,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
