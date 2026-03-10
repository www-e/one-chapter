/**
 * Common Reusable Styles
 * Shared style patterns used across multiple components
 */

import { StyleSheet } from 'react-native';
import { typography, spacing, borderRadius } from '@/constants/design-system';

/**
 * Common style patterns
 * These can be composed into component styles
 */
export const commonStyles = StyleSheet.create({
  // Layout
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gapSm: {
    gap: spacing.sm,
  },
  gapMd: {
    gap: spacing.md,
  },
  gapLg: {
    gap: spacing.lg,
  },

  // Spacing
  pSm: {
    padding: spacing.sm,
  },
  pMd: {
    padding: spacing.md,
  },
  pLg: {
    padding: spacing.lg,
  },
  pXl: {
    padding: spacing.xl,
  },
  pxMd: {
    paddingHorizontal: spacing.md,
  },
  pxLg: {
    paddingHorizontal: spacing.lg,
  },
  pyMd: {
    paddingVertical: spacing.md,
  },
  pyLg: {
    paddingVertical: spacing.lg,
  },

  // Typography
  textDisplay: {
    ...typography.displayMedium,
    fontWeight: '700',
  },
  textHeadline: {
    ...typography.headline,
    fontWeight: '600',
  },
  textBody: {
    ...typography.body,
  },
  textCaption: {
    ...typography.caption,
  },

  // Cards
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBordered: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },

  // Buttons
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  // Status styles
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    display: 'none',
  },
  absolute: {
    position: 'absolute',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

/**
 * Style helper functions for dynamic values
 */
export const styleUtils = {
  /**
   * Create a margin style
   */
  margin: (value: number) => ({ margin: value }),

  /**
   * Create a margin top style
   */
  marginTop: (value: number) => ({ marginTop: value }),

  /**
   * Create a margin bottom style
   */
  marginBottom: (value: number) => ({ marginBottom: value }),

  /**
   * Create opacity style
   */
  opacity: (value: number) => ({ opacity: value }),

  /**
   * Create width percentage style
   */
  width: (percent: number) => ({ width: `${percent}%` }),

  /**
   * Create height percentage style
   */
  height: (percent: number) => ({ height: `${percent}%` }),
};
