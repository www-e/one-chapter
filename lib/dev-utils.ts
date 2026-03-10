/**
 * Development utilities for the todo app
 * These functions are useful for development and debugging
 */

import { clearDatabase, resetDatabase } from '@/lib/storage/seed';

/**
 * Reset the database by clearing all data and reseeding
 * This is useful for development when you want to start fresh
 *
 * Usage:
 * import { devResetDatabase } from '@/lib/dev-utils';
 * await devResetDatabase();
 */
export async function devResetDatabase() {
  console.log('🔄 Development: Resetting database...');
  await resetDatabase();
  console.log('✅ Development: Database reset complete!');
  console.log('⚠️  Please reload the app to see changes.');
}

/**
 * Clear all data from the database without reseeding
 */
export async function devClearDatabase() {
  console.log('🗑️  Development: Clearing database...');
  await clearDatabase();
  console.log('✅ Development: Database cleared!');
}

/**
 * Get database statistics
 */
export async function devGetDatabaseStats() {
  const taskService = require('@/lib/services/taskService').default;
  const categoryService = require('@/lib/services/categoryService').default;

  const tasks = await taskService.getAll();
  const categories = await categoryService.getAll();

  return {
    tasksCount: tasks.length,
    categoriesCount: categories.length,
    completedTasks: tasks.filter((t: any) => t.isCompleted).length,
  };
}
