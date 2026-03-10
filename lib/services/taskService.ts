/**
 * Task Service
 * Business logic for task CRUD operations using file-based storage
 */

import { taskStorage } from '../storage/file-storage';
import { Task, TaskCreateInput, TaskUpdateInput } from '../models/Task.model';
import { Observable, EventEmitter } from '../utils/observable';
import type { Category } from '../models/Category.model';
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
 * Event emitter for task changes
 */
const taskEventEmitter = new EventEmitter<'tasks' | 'count'>();

class TaskService {
  /**
   * Create a new task
   */
  async create(data: TaskCreateInput): Promise<Task> {
    const now = Date.now();
    const task: Task = {
      id: await generateId(),
      title: data.title,
      description: data.description || '',
      isCompleted: false,
      categoryId: data.categoryId,
      createdAt: now,
      updatedAt: now,
    };

    const created = await taskStorage.add(task);
    taskEventEmitter.emit('tasks');
    taskEventEmitter.emit('count');
    return created as Task;
  }

  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    return taskStorage.getAll();
  }

  /**
   * Get tasks by category
   */
  async getByCategory(categoryId: string | null): Promise<Task[]> {
    const allTasks = await this.getAll();

    if (categoryId === null || categoryId === 'all') {
      return allTasks;
    }

    return allTasks.filter((task) => task.categoryId === categoryId);
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task | null> {
    return await taskStorage.findById(id);
  }

  /**
   * Update a task
   */
  async update(id: string, data: TaskUpdateInput): Promise<Task | null> {
    const updates: TaskUpdateInput & { updatedAt: number } = {
      ...data,
      updatedAt: Date.now(),
    };

    const updated = await taskStorage.update(id, updates);
    if (updated) {
      taskEventEmitter.emit('tasks');
    }
    return updated;
  }

  /**
   * Toggle task completion status
   */
  async toggleComplete(id: string): Promise<Task | null> {
    const task = await this.getById(id);
    if (!task) {
      return null;
    }

    return this.update(id, { isCompleted: !task.isCompleted });
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<boolean> {
    const deleted = await taskStorage.delete(id);
    if (deleted) {
      taskEventEmitter.emit('tasks');
      taskEventEmitter.emit('count');
    }
    return deleted;
  }

  /**
   * Get completed tasks
   */
  async getCompleted(): Promise<Task[]> {
    const allTasks = await this.getAll();
    return allTasks.filter((task) => task.isCompleted);
  }

  /**
   * Get active (not completed) tasks
   */
  async getActive(): Promise<Task[]> {
    const allTasks = await this.getAll();
    return allTasks.filter((task) => !task.isCompleted);
  }

  /**
   * Observe tasks (for real-time updates)
   * Returns an observable that emits the current task list
   */
  observeTasks(categoryId: string | null = null): Observable<Task[]> {
    // Get initial data
    const getTasks = async () => {
      if (categoryId === null || categoryId === 'all') {
        return this.getAll();
      }
      return this.getByCategory(categoryId);
    };

    // Create observable with initial empty state
    const observable = new Observable<Task[]>([]);

    // Load initial data
    getTasks().then((tasks) => observable.set(tasks));

    // Subscribe to changes
    const unsubscribe = taskEventEmitter.on(() => {
      getTasks().then((tasks) => observable.set(tasks));
    });

    // Enhance observable to include unsubscribe
    const originalSubscribe = observable.subscribe.bind(observable);
    (observable as any).unsubscribeAll = unsubscribe;

    return observable;
  }

  /**
   * Observe task count
   */
  observeTaskCount(categoryId?: string): Observable<number> {
    const getCount = async () => {
      if (!categoryId) {
        const all = await this.getAll();
        return all.length;
      }
      const byCategory = await this.getByCategory(categoryId);
      return byCategory.length;
    };

    const observable = new Observable<number>(0);

    // Load initial count
    getCount().then((count) => observable.set(count));

    // Subscribe to changes
    const unsubscribe = taskEventEmitter.on(() => {
      getCount().then((count) => observable.set(count));
    });

    (observable as any).unsubscribeAll = unsubscribe;

    return observable;
  }

  /**
   * Get tasks with their categories
   */
  async getWithCategories(categoryService: any): Promise<Array<Task & { category: Category | null }>> {
    const tasks = await this.getAll();
    const result: Array<Task & { category: Category | null }> = [];

    for (const task of tasks) {
      const category = await categoryService.getById(task.categoryId);
      result.push({ ...task, category });
    }

    return result;
  }
}

export default new TaskService();
