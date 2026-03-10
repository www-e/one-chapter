/**
 * Category Service
 * Business logic for category CRUD operations using file-based storage
 */

import { categoryStorage } from '../storage/file-storage';
import { Category, CategoryCreateInput, CategoryUpdateInput, CategoryWithCount } from '../models/Category.model';
import { Observable, EventEmitter } from '../utils/observable';
import taskService from './taskService';
import * as Crypto from 'expo-crypto';

/**
 * Generate a unique ID using Expo Crypto
 * Combines timestamp with cryptographically secure random bytes
 */
async function generateId(): Promise<string> {
  const timestamp = Date.now().toString(36);
  // Use Expo Crypto for React Native compatibility
  const randomBytes = await Crypto.getRandomBytesAsync(8);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${timestamp}-${randomHex}`;
}

/**
 * Event emitter for category changes
 */
const categoryEventEmitter = new EventEmitter<void>();

class CategoryService {
  /**
   * Create a new category
   */
  async create(data: CategoryCreateInput): Promise<Category> {
    const category: Category = {
      id: await generateId(),
      name: data.name,
      color: data.color,
      createdAt: Date.now(),
    };

    const created = await categoryStorage.add(category);
    categoryEventEmitter.emit();
    return created as Category;
  }

  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    return await categoryStorage.getAll();
  }

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<Category | null> {
    return await categoryStorage.findById(id);
  }

  /**
   * Get category by name
   */
  async getByName(name: string): Promise<Category | null> {
    const categories = await this.getAll();
    return categories.find((cat) => cat.name === name) || null;
  }

  /**
   * Update a category
   */
  async update(id: string, data: CategoryUpdateInput): Promise<Category | null> {
    const updated = await categoryStorage.update(id, data);
    if (updated) {
      categoryEventEmitter.emit();
    }
    return updated;
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<boolean> {
    // First, delete all tasks associated with this category
    const tasks = await taskService.getByCategory(id);
    for (const task of tasks) {
      await taskService.delete(task.id);
    }

    // Then delete the category
    const deleted = await categoryStorage.delete(id);
    if (deleted) {
      categoryEventEmitter.emit();
    }
    return deleted;
  }

  /**
   * Get task count for a category
   */
  async getTaskCount(categoryId: string): Promise<number> {
    const tasks = await taskService.getByCategory(categoryId);
    return tasks.length;
  }

  /**
   * Observe categories (for real-time updates)
   */
  observeCategories(): Observable<Category[]> {
    const observable = new Observable<Category[]>([]);

    // Load initial data
    this.getAll().then((categories) => observable.set(categories));

    // Subscribe to changes
    const unsubscribe = categoryEventEmitter.on(() => {
      this.getAll().then((categories) => observable.set(categories));
    });

    (observable as any).unsubscribeAll = unsubscribe;

    return observable;
  }

  /**
   * Observe task count for a category
   */
  observeTaskCount(categoryId: string): Observable<number> {
    const observable = new Observable<number>(0);

    // Load initial count
    this.getTaskCount(categoryId).then((count) => observable.set(count));

    // Subscribe to task changes (since task count depends on tasks)
    const unsubscribe = categoryEventEmitter.on(async () => {
      const count = await this.getTaskCount(categoryId);
      observable.set(count);
    });

    (observable as any).unsubscribeAll = unsubscribe;

    return observable;
  }

  /**
   * Get all categories with task counts
   */
  async getAllWithCounts(): Promise<CategoryWithCount[]> {
    const categories = await this.getAll();
    const result: CategoryWithCount[] = [];

    for (const category of categories) {
      const taskCount = await this.getTaskCount(category.id);
      result.push({
        ...category,
        taskCount,
      });
    }

    return result;
  }
}

export default new CategoryService();
