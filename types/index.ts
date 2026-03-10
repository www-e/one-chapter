/**
 * Shared Type Definitions
 * Centralized types to avoid duplication across the codebase
 */

// Re-export model types
export type { Task, TaskCreateInput, TaskUpdateInput, TaskWithCategory } from '@/lib/models/Task.model';
export type { Category, CategoryCreateInput, CategoryUpdateInput, CategoryWithCount } from '@/lib/models/Category.model';

/**
 * Extended Task type with runtime category data
 * Used in components where category is hydrated
 */
export interface TaskWithCategoryData {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
  category: CategoryData;
}

/**
 * Lightweight category data attached to tasks
 */
export interface CategoryData {
  id: string;
  name: string;
  color: string;
}

/**
 * Category with optional task count
 */
export interface CategoryWithOptionalCount extends CategoryData {
  _count?: {
    tasks: number;
  };
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Modal state
 */
export interface ModalState {
  isVisible: boolean;
  data?: any;
}
