/**
 * Category Model
 * Simple TypeScript interface (no decorators)
 */

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface CategoryCreateInput {
  name: string;
  color: string;
}

export interface CategoryUpdateInput {
  name?: string;
  color?: string;
}

export interface CategoryWithCount extends Category {
  taskCount: number;
}
