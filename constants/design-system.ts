/**
 * Design System Tokens for Glass & Gradients UI
 * Centralized design tokens supporting light/dark themes with glassmorphism effects
 */

// ============================================
// COLOR SYSTEM
// ============================================

export interface ColorTokens {
  // Base colors
  primary: string;
  secondary: string;
  tertiary: string;

  // Gradients
  primaryGradient: {
    start: string;
    end: string;
  };
  backgroundGradient: {
    start: string;
    middle: string;
    end: string;
  };

  // Backgrounds
  background: string;

  // Surfaces (with opacity for glass effects)
  surface: string;
  surfaceVariant: string;

  // Glass effects
  glass: {
    background: string;
    border: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };

  // Action gradients
  actionGradients: {
    delete: {
      start: string;
      end: string;
    };
    edit: {
      start: string;
      end: string;
    };
    success: {
      start: string;
      end: string;
    };
  };

  // Semantic colors
  error: string;
  warning: string;
  info: string;
  success: string;
}

// Light mode colors
export const lightColors: ColorTokens = {
  primary: '#6B9B9A',
  secondary: '#8DBFB0',
  tertiary: '#A8C9B2',

  primaryGradient: {
    start: '#6B9B9A',
    end: '#8DBFB0',
  },

  backgroundGradient: {
    start: '#FAFBFB',
    middle: '#F5F7F7',
    end: '#FAFBFB',
  },

  background: '#FAFBFB',

  surface: 'rgba(255, 255, 255, 0.95)',
  surfaceVariant: 'rgba(255, 255, 255, 0.85)',

  glass: {
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 255, 255, 0.18)',
  },

  text: {
    primary: '#1A1D1E',
    secondary: 'rgba(26, 29, 30, 0.68)',
    tertiary: 'rgba(26, 29, 30, 0.45)',
    inverse: '#FFFFFF',
  },

  actionGradients: {
    delete: {
      start: '#D68A8A',
      end: '#E8A0A0',
    },
    edit: {
      start: '#8AB096',
      end: '#A8C9B2',
    },
    success: {
      start: '#8AB096',
      end: '#A8C9B2',
    },
  },

  error: '#D68A8A',
  warning: '#E5C07B',
  info: '#8DBFB0',
  success: '#8AB096',
};

// Dark mode colors
export const darkColors: ColorTokens = {
  primary: '#8DBFB0',
  secondary: '#6B9B9A',
  tertiary: '#A8C9B2',

  primaryGradient: {
    start: '#8DBFB0',
    end: '#6B9B9A',
  },

  backgroundGradient: {
    start: '#1A1D1E',
    middle: '#151718',
    end: '#1A1D1E',
  },

  background: '#1A1D1E',

  surface: 'rgba(37, 40, 41, 0.95)',
  surfaceVariant: 'rgba(37, 40, 41, 0.85)',

  glass: {
    background: 'rgba(37, 40, 41, 0.7)',
    border: 'rgba(255, 255, 255, 0.08)',
  },

  text: {
    primary: '#FAFBFB',
    secondary: 'rgba(250, 251, 251, 0.68)',
    tertiary: 'rgba(250, 251, 251, 0.45)',
    inverse: '#1A1D1E',
  },

  actionGradients: {
    delete: {
      start: '#D68A8A',
      end: '#E8A0A0',
    },
    edit: {
      start: '#8AB096',
      end: '#A8C9B2',
    },
    success: {
      start: '#8AB096',
      end: '#A8C9B2',
    },
  },

  error: '#D68A8A',
  warning: '#E5C07B',
  info: '#8DBFB0',
  success: '#8AB096',
};

// ============================================
// TYPOGRAPHY SCALE
// ============================================

export interface TypographyTokens {
  displayLarge: {
    fontSize: number;
    fontWeight: '600' | '700' | '400' | '500';
    lineHeight: number;
  };
  displayMedium: {
    fontSize: number;
    fontWeight: '600' | '700' | '400' | '500';
    lineHeight: number;
  };
  headline: {
    fontSize: number;
    fontWeight: '600' | '700' | '400' | '500';
    lineHeight: number;
  };
  bodyLarge: {
    fontSize: number;
    fontWeight: '600' | '700' | '400' | '500';
    lineHeight: number;
  };
  body: {
    fontSize: number;
    fontWeight: '600' | '700' | '400' | '500';
    lineHeight: number;
  };
  caption: {
    fontSize: number;
    fontWeight: '600' | '700' | '400' | '500';
    lineHeight: number;
  };
}

export const typography: TypographyTokens = {
  displayLarge: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  displayMedium: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  headline: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
};

// ============================================
// SPACING SCALE (4px grid)
// ============================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export type Spacing = keyof typeof spacing;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export type BorderRadius = keyof typeof borderRadius;

// ============================================
// SHADOWS
// ============================================

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  glass: string;
}

export const lightShadows: ShadowTokens = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
  md: '0 4px 16px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
  glass: '0 8px 32px rgba(0, 0, 0, 0.06)',
};

export const darkShadows: ShadowTokens = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
  md: '0 4px 16px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
  glass: '0 8px 32px rgba(0, 0, 0, 0.15)',
};

// ============================================
// ANIMATION TIMING
// ============================================

export const animation = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  spring: {
    damping: 15,
    stiffness: 150,
  },
} as const;

// ============================================
// COMPLETE DESIGN TOKEN INTERFACE
// ============================================

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: ShadowTokens;
  animation: typeof animation;
}

// ============================================
// HELPER FUNCTION: Theme-aware tokens
// ============================================

/**
 * Returns design tokens for the specified theme
 * @param isDark - Whether to use dark mode tokens
 * @returns Complete design token set
 */
export function useDesignTokens(isDark: boolean = false): DesignTokens {
  return {
    colors: isDark ? darkColors : lightColors,
    typography,
    spacing,
    borderRadius,
    shadows: isDark ? darkShadows : lightShadows,
    animation,
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  lightColors,
  darkColors,
  typography,
  spacing,
  borderRadius,
  lightShadows,
  darkShadows,
  animation,
  useDesignTokens,
};
