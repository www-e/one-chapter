/**
 * File-based Storage Layer
 * Simple, reliable key-value storage using Expo FileSystem
 * Works with Expo Go (no custom native modules required)
 */

import * as FS from 'expo-file-system/legacy';

// Type for items with ID field
type WithId = { id: string };

// Storage keys
export const STORAGE_KEYS = {
  CATEGORIES: '@todo_categories',
  TASKS: '@todo_tasks',
} as const;

// File directory for storage
const STORAGE_DIR = `${FS.documentDirectory || ''}todo-storage/`;

// Ensure storage directory exists
const ensureStorageDir = async () => {
  const dirInfo = await FS.getInfoAsync(STORAGE_DIR);
  if (!dirInfo.exists) {
    await FS.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
};

// Get file path for a key
const getFilePath = (key: string): string => {
  const fileName = `${key.replace(/[^a-z0-9]/gi, '_')}.json`;
  return `${STORAGE_DIR}${fileName}`;
};

/**
 * Generic storage interface with type safety
 * @template T - The type of items stored (must have an id field)
 */
class Storage<T extends WithId> {
  private filePath: string;
  private cache: T[] | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private key: string) {
    this.filePath = getFilePath(key);
    // Initialize async but don't block constructor
    this.initPromise = this.loadCache();
  }

  /**
   * Load data into cache (called during construction)
   */
  private async loadCache(): Promise<void> {
    try {
      await ensureStorageDir();
      const fileInfo = await FS.getInfoAsync(this.filePath);

      if (fileInfo.exists) {
        const content = await FS.readAsStringAsync(this.filePath);
        this.cache = JSON.parse(content);
      } else {
        this.cache = [];
      }
    } catch (error) {
      console.error(`Error loading cache for ${this.key}:`, error);
      this.cache = [];
    }
  }

  /**
   * Wait for cache to be initialized
   */
  private async ensureCache(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    if (this.cache === null) {
      await this.loadCache();
    }
  }

  /**
   * Get all items from storage
   */
  async getAll(): Promise<T[]> {
    await this.ensureCache();
    return this.cache || [];
  }

  /**
   * Save all items to storage
   */
  private async saveAll(items: T[]): Promise<void> {
    try {
      await ensureStorageDir();
      this.cache = items;
      await FS.writeAsStringAsync(this.filePath, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${this.key}:`, error);
      throw error;
    }
  }

  /**
   * Add a new item to storage
   */
  async add(item: T): Promise<T> {
    const items = await this.getAll();
    items.push(item);
    await this.saveAll(items);
    return item;
  }

  /**
   * Update an item by ID
   */
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const items = await this.getAll();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    items[index] = { ...items[index], ...updates };
    await this.saveAll(items);
    return items[index];
  }

  /**
   * Delete an item by ID
   */
  async delete(id: string): Promise<boolean> {
    const items = await this.getAll();
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return false; // Item not found
    }

    // Remove the item from the array
    items.splice(itemIndex, 1);
    await this.saveAll(items);
    return true;
  }

  /**
   * Find an item by ID
   */
  async findById(id: string): Promise<T | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  /**
   * Find items by predicate
   */
  async find(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.getAll();
    return items.filter(predicate);
  }

  /**
   * Clear all items
   */
  async clear(): Promise<void> {
    await this.saveAll([]);
  }
}

// Export typed storage instances with proper types
import type { Category } from '../models/Category.model';
import type { Task } from '../models/Task.model';

export const categoryStorage = new Storage<Category>(STORAGE_KEYS.CATEGORIES);
export const taskStorage = new Storage<Task>(STORAGE_KEYS.TASKS);

// Export raw FileSystem for advanced use cases
export { FS as FileSystem };
