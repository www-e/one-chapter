/**
 * Unit tests for categoryService.ts
 */

import categoryService from './categoryService';
import type { CategoryCreateInput, CategoryUpdateInput } from '../models/Category.model';

// Mock the storage layer
jest.mock('../storage/file-storage', () => ({
  categoryStorage: {
    add: jest.fn(),
    getAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock taskService
jest.mock('./taskService', () => ({
  default: {
    getByCategory: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock expo-crypto for ID generation
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(() =>
    Promise.resolve(new Uint8Array([0xCD, 0xCD, 0xCD, 0xCD, 0xCD, 0xCD, 0xCD, 0xCD]))
  ),
}));

import { categoryStorage } from '../storage/file-storage';
import taskService from './taskService';

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategory = {
    id: 'cat-1',
    name: 'Work',
    color: '#6B9B9A',
    createdAt: 1234567890,
  };

  describe('create', () => {
    it('should create a new category with generated ID', async () => {
      (categoryStorage.add as jest.Mock).mockResolvedValue(mockCategory);

      const input: CategoryCreateInput = {
        name: 'Personal',
        color: '#8DBFB0',
      };

      const result = await categoryService.create(input);

      expect(result).toBeDefined();
      expect(result.name).toBe(input.name);
      expect(result.color).toBe(input.color);
      expect(categoryStorage.add).toHaveBeenCalled();
    });

    it('should generate unique ID', async () => {
      (categoryStorage.add as jest.Mock).mockResolvedValue(mockCategory);

      const input: CategoryCreateInput = {
        name: 'Work',
        color: '#6B9B9A',
      };

      const result = await categoryService.create(input);

      expect(result.id).toMatch(/^[a-z0-9]+-[a-f0-9]{16}$/i);
      expect(result.createdAt).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      (categoryStorage.getAll as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await categoryService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCategory);
    });
  });

  describe('getById', () => {
    it('should return category when found', async () => {
      (categoryStorage.findById as jest.Mock).mockResolvedValue(mockCategory);

      const result = await categoryService.getById('cat-1');

      expect(result).toEqual(mockCategory);
    });

    it('should return null when not found', async () => {
      (categoryStorage.findById as jest.Mock).mockResolvedValue(null);

      const result = await categoryService.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getByName', () => {
    it('should return category when found by name', async () => {
      (categoryStorage.getAll as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await categoryService.getByName('Work');

      expect(result).toEqual(mockCategory);
    });

    it('should return null when name not found', async () => {
      (categoryStorage.getAll as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await categoryService.getByName('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update category with provided data', async () => {
      const updatedCategory = {
        ...mockCategory,
        name: 'Updated Name',
      };
      (categoryStorage.update as jest.Mock).mockResolvedValue(updatedCategory);

      const updates: CategoryUpdateInput = {
        name: 'Updated Name',
      };

      const result = await categoryService.update('cat-1', updates);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Updated Name');
    });

    it('should return null when category not found', async () => {
      (categoryStorage.update as jest.Mock).mockResolvedValue(null);

      const result = await categoryService.update('non-existent', {
        name: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete category and its associated tasks', async () => {
      const mockTasks = [
        { id: 'task-1', categoryId: 'cat-1' },
        { id: 'task-2', categoryId: 'cat-1' },
      ];

      (taskService.getByCategory as jest.Mock).mockResolvedValue(mockTasks);
      (taskService.delete as jest.Mock).mockResolvedValue(true);
      (categoryStorage.delete as jest.Mock).mockResolvedValue(true);

      const result = await categoryService.delete('cat-1');

      expect(result).toBe(true);
      expect(taskService.getByCategory).toHaveBeenCalledWith('cat-1');
      expect(taskService.delete).toHaveBeenCalledTimes(2);
      expect(categoryStorage.delete).toHaveBeenCalledWith('cat-1');
    });

    it('should return false when category not found', async () => {
      (taskService.getByCategory as jest.Mock).mockResolvedValue([]);
      (categoryStorage.delete as jest.Mock).mockResolvedValue(false);

      const result = await categoryService.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should handle category with no tasks', async () => {
      (taskService.getByCategory as jest.Mock).mockResolvedValue([]);
      (categoryStorage.delete as jest.Mock).mockResolvedValue(true);

      const result = await categoryService.delete('cat-1');

      expect(result).toBe(true);
      expect(taskService.delete).not.toHaveBeenCalled();
    });
  });

  describe('getTaskCount', () => {
    it('should return task count for category', async () => {
      const mockTasks = [
        { id: 'task-1' },
        { id: 'task-2' },
        { id: 'task-3' },
      ];

      (taskService.getByCategory as jest.Mock).mockResolvedValue(mockTasks);

      const result = await categoryService.getTaskCount('cat-1');

      expect(result).toBe(3);
    });

    it('should return 0 for category with no tasks', async () => {
      (taskService.getByCategory as jest.Mock).mockResolvedValue([]);

      const result = await categoryService.getTaskCount('cat-1');

      expect(result).toBe(0);
    });
  });

  describe('getAllWithCounts', () => {
    it('should return categories with task counts', async () => {
      const categories = [
        mockCategory,
        { ...mockCategory, id: 'cat-2', name: 'Personal' },
      ];

      (categoryStorage.getAll as jest.Mock).mockResolvedValue(categories);

      // Mock task counts for each category
      (taskService.getByCategory as jest.Mock)
        .mockResolvedValueOnce([{ id: 'task-1' }, { id: 'task-2' }])
        .mockResolvedValueOnce([{ id: 'task-3' }]);

      const result = await categoryService.getAllWithCounts();

      expect(result).toHaveLength(2);
      expect(result[0].taskCount).toBe(2);
      expect(result[1].taskCount).toBe(1);
    });

    it('should return 0 count for categories with no tasks', async () => {
      (categoryStorage.getAll as jest.Mock).mockResolvedValue([mockCategory]);
      (taskService.getByCategory as jest.Mock).mockResolvedValue([]);

      const result = await categoryService.getAllWithCounts();

      expect(result).toHaveLength(1);
      expect(result[0].taskCount).toBe(0);
    });
  });
});
