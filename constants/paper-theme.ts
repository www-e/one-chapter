import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightColors, darkColors } from './design-system';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    secondary: lightColors.primaryGradient.end,
    tertiary: lightColors.text.secondary,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceVariant,
    error: darkColors.actionGradients.delete.start,
    onPrimary: '#FFFFFF',
    onSecondary: '#2C3E3D',
    onSurface: lightColors.text.primary,
    onBackground: lightColors.text.primary,
    onError: '#FFFFFF',
    outline: lightColors.text.tertiary,
    outlineVariant: 'rgba(0,0,0,0.05)',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    secondary: darkColors.primaryGradient.end,
    tertiary: darkColors.text.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    error: darkColors.actionGradients.delete.start,
    onPrimary: darkColors.background,
    onSecondary: darkColors.text.primary,
    onSurface: darkColors.text.primary,
    onBackground: darkColors.text.primary,
    onError: darkColors.background,
    outline: darkColors.text.tertiary,
    outlineVariant: 'rgba(255,255,255,0.05)',
  },
};
