/**
 * Task Model
 * Simple TypeScript interface (no decorators)
 */
import { Category } from "./Category.model";

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  categoryId: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  categoryId?: string;
}

export interface TaskWithCategory extends Task {
  category?: Category;
}

// Import Category for TaskWithCategory
