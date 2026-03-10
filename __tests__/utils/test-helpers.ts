/**
 * Test utility functions and factory helpers
 */

import type { Task, TaskCreateInput } from '@/lib/models/Task.model';
import type { Category, CategoryCreateInput } from '@/lib/models/Category.model';

/**
 * Create a mock category with default values
 */
export function createMockCategory(overrides: Partial<CategoryCreateInput> = {}): Category {
  const timestamp = Date.now();
  return {
    id: `cat-${timestamp}`,
    name: overrides.name || 'Test Category',
    color: overrides.color || '#6B9B9A',
    createdAt: timestamp,
  };
}

/**
 * Create a mock task with default values
 */
export function createMockTask(overrides: Partial<TaskCreateInput & { id?: string; createdAt?: number; updatedAt?: number }> = {}): Task {
  const timestamp = Date.now();
  return {
    id: overrides.id || `task-${timestamp}`,
    title: overrides.title || 'Test Task',
    description: overrides.description || 'Test description',
    isCompleted: false,
    categoryId: overrides.categoryId || 'cat-default',
    createdAt: overrides.createdAt || timestamp,
    updatedAt: overrides.updatedAt || timestamp,
  };
}

/**
 * Create an array of mock categories
 */
export function createMockCategories(count: number): Category[] {
  return Array.from({ length: count }, (_, i) =>
    createMockCategory({
      name: `Category ${i + 1}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    })
  );
}

/**
 * Create an array of mock tasks
 */
export function createMockTasks(count: number, categoryId: string = 'cat-default'): Task[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      title: `Task ${i + 1}`,
      categoryId,
    })
  );
}

/**
 * Mock file system storage for testing
 */
export class MockFileSystem {
  private storage = new Map<string, string>();

  async writeFile(path: string, content: string): Promise<void> {
    this.storage.set(path, content);
  }

  async readFile(path: string): Promise<string> {
    return this.storage.get(path) || '[]';
  }

  async exists(path: string): Promise<boolean> {
    return this.storage.has(path);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Wait for async operations to complete
 */
export async function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock crypto.getRandomValues for testing
 */
export function mockCryptoGetRandomValues(value: number): void {
  const mockBytes = new Uint8Array(8).fill(value);
  (global.crypto as any) = {
    getRandomValues: jest.fn(() => mockBytes),
  };
}

/**
 * Restore original crypto implementation
 */
export function restoreCrypto(): void {
  // Web Crypto is typically available in test environment
  if (typeof crypto !== 'undefined') {
    // Keep the real crypto for ID generation
  }
}
