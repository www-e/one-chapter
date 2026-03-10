/**
 * Jest setup file for React Native testing
 */

import '@testing-library/jest-native/extend-expect';

// Mock expo-file-system globally
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/tmp/test-docs/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

// Mock expo-crypto for ID generation
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(() =>
    Promise.resolve(new Uint8Array([0xAB, 0xAB, 0xAB, 0xAB, 0xAB, 0xAB, 0xAB, 0xAB]))
  ),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock react-native-toast-notifications
jest.mock('react-native-toast-notifications', () => ({
  useToast: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    hideAll: jest.fn(),
  })),
  Toast: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

// Global test utilities
global.mockNow = Date.now();

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
