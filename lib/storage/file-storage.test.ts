/**
 * Unit tests for file-storage.ts
 */

import { Storage } from './file-storage';
import type { Task } from '../models/Task.model';
import type { Category } from '../models/Category.model';

// Mock expo-file-system
import * as FS from 'expo-file-system/legacy';

const mockFileSystem = {
  documentDirectory: '/tmp/test-docs/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
};

jest.mock('expo-file-system/legacy', () => mockFileSystem);

describe('Storage', () => {
  let storage: Storage<Task>;

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    categoryId: 'cat-1',
    createdAt: 1234567890,
    updatedAt: 1234567890,
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mock returns
    (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: false,
    });
    (mockFileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue('[]');
    (mockFileSystem.writeStringAsync as jest.Mock).mockResolvedValue(undefined);

    storage = new Storage<Task>('@test_tasks');
  });

  describe('constructor', () => {
    it('should initialize with correct file path', () => {
      expect(storage).toBeDefined();
    });

    it('should create storage directory during initialization', async () => {
      await storage.getAll();
      expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return empty array when file does not exist', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: false,
      });

      const result = await storage.getAll();
      expect(result).toEqual([]);
    });

    it('should return items from existing file', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      const result = await storage.getAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTask);
    });

    it('should return empty array on parse error', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue('invalid json');

      const result = await storage.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should add item to storage', async () => {
      await storage.add(mockTask);

      expect(mockFileSystem.writeStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify([mockTask])
      );
    });

    it('should preserve existing items when adding new item', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      const newTask: Task = {
        ...mockTask,
        id: 'task-2',
        title: 'Another Task',
      };

      await storage.add(newTask);

      expect(mockFileSystem.writeStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify([mockTask, newTask])
      );
    });
  });

  describe('findById', () => {
    it('should return item when found', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      const result = await storage.findById('task-1');
      expect(result).toEqual(mockTask);
    });

    it('should return null when not found', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      const result = await storage.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing item', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      const updated = await storage.update('task-1', {
        title: 'Updated Title',
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
    });

    it('should return null when item not found', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      const result = await storage.update('non-existent', {
        title: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete item when found', async () => {
      const task2: Task = {
        ...mockTask,
        id: 'task-2',
        title: 'Second Task',
      };

      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask, task2])
      );

      const result = await storage.delete('task-1');

      expect(result).toBe(true);
      expect(mockFileSystem.writeStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        JSON.stringify([task2])
      );
    });

    it('should return false when item not found', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      const result = await storage.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should handle empty storage', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue('[]');

      const result = await storage.delete('task-1');

      expect(result).toBe(false);
    });
  });

  describe('find', () => {
    it('should filter items by predicate', async () => {
      const completedTask: Task = {
        ...mockTask,
        id: 'task-2',
        isCompleted: true,
      };

      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask, completedTask])
      );

      const result = await storage.find((task) => task.isCompleted);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-2');
    });
  });

  describe('clear', () => {
    it('should clear all items', async () => {
      (mockFileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      });
      (mockFileSystem.readStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify([mockTask])
      );

      await storage.clear();

      expect(mockFileSystem.writeStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        '[]'
      );
    });
  });
});
