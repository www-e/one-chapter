/**
 * Unit tests for taskService.ts
 */

import taskService from './taskService';
import type { TaskCreateInput, TaskUpdateInput } from '../models/Task.model';

// Mock the storage layer
jest.mock('../storage/file-storage', () => ({
  taskStorage: {
    add: jest.fn(),
    getAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock expo-crypto for ID generation
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(() =>
    Promise.resolve(new Uint8Array([0xAB, 0xAB, 0xAB, 0xAB, 0xAB, 0xAB, 0xAB, 0xAB]))
  ),
}));

import { taskStorage } from '../storage/file-storage';

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    categoryId: 'cat-1',
    createdAt: 1234567890,
    updatedAt: 1234567890,
  };

  describe('create', () => {
    it('should create a new task with generated ID', async () => {
      (taskStorage.add as jest.Mock).mockResolvedValue(mockTask);

      const input: TaskCreateInput = {
        title: 'New Task',
        description: 'Description',
        categoryId: 'cat-1',
      };

      const result = await taskService.create(input);

      expect(result).toBeDefined();
      expect(result.title).toBe(input.title);
      expect(result.description).toBe(input.description);
      expect(result.isCompleted).toBe(false);
      expect(taskStorage.add).toHaveBeenCalled();
    });

    it('should set default description to empty string', async () => {
      (taskStorage.add as jest.Mock).mockResolvedValue(mockTask);

      const input: TaskCreateInput = {
        title: 'New Task',
        categoryId: 'cat-1',
      };

      await taskService.create(input);

      const addedTask = (taskStorage.add as jest.Mock).mock.calls[0][0];
      expect(addedTask.description).toBe('');
    });

    it('should generate unique ID with timestamp and random bytes', async () => {
      (taskStorage.add as jest.Mock).mockResolvedValue(mockTask);

      const input: TaskCreateInput = {
        title: 'New Task',
        categoryId: 'cat-1',
      };

      const result = await taskService.create(input);

      expect(result.id).toMatch(/^[a-z0-9]+-[a-f0-9]{16}$/i);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return all tasks', async () => {
      (taskStorage.getAll as jest.Mock).mockResolvedValue([mockTask]);

      const result = await taskService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTask);
    });
  });

  describe('getByCategory', () => {
    it('should return all tasks when categoryId is null', async () => {
      (taskStorage.getAll as jest.Mock).mockResolvedValue([mockTask]);

      const result = await taskService.getByCategory(null);

      expect(result).toHaveLength(1);
    });

    it('should return all tasks when categoryId is "all"', async () => {
      (taskStorage.getAll as jest.Mock).mockResolvedValue([mockTask]);

      const result = await taskService.getByCategory('all');

      expect(result).toHaveLength(1);
    });

    it('should filter tasks by categoryId', async () => {
      const task2 = { ...mockTask, id: 'task-2', categoryId: 'cat-2' };
      (taskStorage.getAll as jest.Mock).mockResolvedValue([mockTask, task2]);

      const result = await taskService.getByCategory('cat-1');

      expect(result).toHaveLength(1);
      expect(result[0].categoryId).toBe('cat-1');
    });
  });

  describe('getById', () => {
    it('should return task when found', async () => {
      (taskStorage.findById as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.getById('task-1');

      expect(result).toEqual(mockTask);
    });

    it('should return null when not found', async () => {
      (taskStorage.findById as jest.Mock).mockResolvedValue(null);

      const result = await taskService.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update task with provided data', async () => {
      const updatedTask = {
        ...mockTask,
        title: 'Updated Title',
        description: 'Updated description',
      };
      (taskStorage.update as jest.Mock).mockResolvedValue(updatedTask);

      const updates: TaskUpdateInput = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const result = await taskService.update('task-1', updates);

      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
      expect(result?.description).toBe('Updated description');
    });

    it('should update updatedAt timestamp', async () => {
      const originalUpdatedAt = 1234567890;
      const updatedTask = {
        ...mockTask,
        updatedAt: originalUpdatedAt + 1000,
      };
      (taskStorage.update as jest.Mock).mockResolvedValue(updatedTask);

      await taskService.update('task-1', { title: 'Updated' });

      const updateCall = (taskStorage.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].updatedAt).toBeDefined();
    });

    it('should return null when task not found', async () => {
      (taskStorage.update as jest.Mock).mockResolvedValue(null);

      const result = await taskService.update('non-existent', {
        title: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('toggleComplete', () => {
    it('should toggle isCompleted from false to true', async () => {
      const completedTask = { ...mockTask, isCompleted: true };
      (taskStorage.findById as jest.Mock).mockResolvedValue(mockTask);
      (taskStorage.update as jest.Mock).mockResolvedValue(completedTask);

      const result = await taskService.toggleComplete('task-1');

      expect(result?.isCompleted).toBe(true);
    });

    it('should toggle isCompleted from true to false', async () => {
      const completedTask = { ...mockTask, isCompleted: true };
      const uncompletedTask = { ...mockTask, isCompleted: false };
      (taskStorage.findById as jest.Mock).mockResolvedValue(completedTask);
      (taskStorage.update as jest.Mock).mockResolvedValue(uncompletedTask);

      const result = await taskService.toggleComplete('task-1');

      expect(result?.isCompleted).toBe(false);
    });

    it('should return null when task not found', async () => {
      (taskStorage.findById as jest.Mock).mockResolvedValue(null);

      const result = await taskService.toggleComplete('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      (taskStorage.delete as jest.Mock).mockResolvedValue(true);

      const result = await taskService.delete('task-1');

      expect(result).toBe(true);
      expect(taskStorage.delete).toHaveBeenCalledWith('task-1');
    });

    it('should return false when task not found', async () => {
      (taskStorage.delete as jest.Mock).mockResolvedValue(false);

      const result = await taskService.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getCompleted', () => {
    it('should return only completed tasks', async () => {
      const completedTask = { ...mockTask, isCompleted: true };
      const pendingTask = { ...mockTask, id: 'task-2', isCompleted: false };
      (taskStorage.getAll as jest.Mock).mockResolvedValue([
        pendingTask,
        completedTask,
      ]);

      const result = await taskService.getCompleted();

      expect(result).toHaveLength(1);
      expect(result[0].isCompleted).toBe(true);
    });
  });

  describe('getActive', () => {
    it('should return only active (not completed) tasks', async () => {
      const completedTask = { ...mockTask, isCompleted: true };
      const pendingTask = { ...mockTask, id: 'task-2', isCompleted: false };
      (taskStorage.getAll as jest.Mock).mockResolvedValue([
        pendingTask,
        completedTask,
      ]);

      const result = await taskService.getActive();

      expect(result).toHaveLength(1);
      expect(result[0].isCompleted).toBe(false);
    });
  });
});
