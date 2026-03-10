import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, useColorScheme, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, spacing, borderRadius, typography } from '@/constants/design-system';

const SWIPE_HINT_STORAGE_KEY = '@swipe_hint_shown';

interface SwipeHintModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function SwipeHintModal({ visible, onDismiss }: SwipeHintModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const swipeRightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Start auto swipe animations after a delay
      setTimeout(() => {
        startAutoSwipe();
      }, 800);
    }
  }, [visible]);

  const startAutoSwipe = () => {
    // Swipe left animation loop
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(swipeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(600),
      Animated.timing(swipeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(swipeRightAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(600),
      Animated.timing(swipeRightAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
    ]).start((finished) => {
      if (finished && visible) {
        startAutoSwipe();
      }
    });
  };

  const handleDismiss = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Mark as shown
    try {
      await AsyncStorage.setItem(SWIPE_HINT_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Failed to save swipe hint status:', error);
    }
    onDismiss();
  };

  const swipeLeftStyle = {
    transform: [
      {
        translateX: swipeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
        }),
      },
    ],
  };

  const swipeRightStyle = {
    transform: [
      {
        translateX: swipeRightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 30],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.glass.border }]}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons name="hand-left" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text.primary }]}>Swipe Gestures</Text>

            {/* Message */}
            <Text style={[styles.message, { color: colors.text.secondary }]}>
              You can quickly edit or delete tasks with swipe gestures!
            </Text>

            {/* Swipe Demo */}
            <View style={styles.swipeDemo}>
              <View style={styles.swipeRow}>
                <Animated.View style={[styles.swipeDemoCard, swipeLeftStyle]}>
                  <Ionicons name="trash-outline" size={24} color="#D68A8A" />
                  <Text style={[styles.swipeDemoText, { color: colors.text.tertiary }]}>← Swipe Left to Delete</Text>
                </Animated.View>
              </View>

              <View style={styles.swipeRow}>
                <Animated.View style={[styles.swipeDemoCard, swipeRightStyle]}>
                  <Ionicons name="create-outline" size={24} color="#8AB096" />
                  <Text style={[styles.swipeDemoText, { color: colors.text.tertiary }]}>Swipe Right to Edit →</Text>
                </Animated.View>
              </View>
            </View>

            {/* Action Buttons */}
            <Pressable
              onPress={handleDismiss}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.buttonText}>Got it!</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...typography.displayMedium,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  swipeDemo: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  swipeRow: {
    alignItems: 'center',
  },
  swipeDemoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  swipeDemoText: {
    ...typography.body,
    flex: 1,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodyLarge,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export async function hasSeenSwipeHint(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SWIPE_HINT_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Failed to check swipe hint status:', error);
    return false;
  }
}
