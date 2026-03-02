import { describe, it, expect, beforeEach, vi } from 'vitest';
import { taskService } from '../../services/taskService';
import { mockAPI } from '../../api/mockAPI';

vi.mock('../../api/mockAPI', () => ({
  mockAPI: {
    getTasks: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTask: vi.fn(),
    archiveTask: vi.fn(),
    unarchiveTask: vi.fn(),
  },
}));

describe('Task Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should get tasks with default filters', async () => {
      const mockTasks = [{ id: 1, title: 'Test Task' }];
      mockAPI.getTasks.mockResolvedValue(mockTasks);

      const result = await taskService.getTasks();

      expect(mockAPI.getTasks).toHaveBeenCalledWith('', false);
      expect(result).toEqual(mockTasks);
    });

    it('should get tasks with search filter', async () => {
      const mockTasks = [{ id: 1, title: 'React Task' }];
      mockAPI.getTasks.mockResolvedValue(mockTasks);

      await taskService.getTasks({ search: 'React', archived: false });

      expect(mockAPI.getTasks).toHaveBeenCalledWith('React', false);
    });

    it('should get archived tasks', async () => {
      const mockTasks = [{ id: 1, title: 'Archived Task', archived: true }];
      mockAPI.getTasks.mockResolvedValue(mockTasks);

      await taskService.getTasks({ archived: true });

      expect(mockAPI.getTasks).toHaveBeenCalledWith('', true);
    });
  });

  describe('createTask', () => {
    it('should create task with createdAt timestamp', async () => {
      const taskData = { title: 'New Task', description: 'Test' };
      const mockResponse = { ...taskData, id: 1, createdAt: expect.any(String) };
      mockAPI.addTask.mockResolvedValue(mockResponse);

      await taskService.createTask(taskData);

      expect(mockAPI.addTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          description: 'Test',
          createdAt: expect.any(String),
        })
      );
    });
  });

  describe('updateTask', () => {
    it('should update task', async () => {
      const updates = { title: 'Updated Task' };
      mockAPI.updateTask.mockResolvedValue({ id: 1, ...updates });

      const result = await taskService.updateTask(1, updates);

      expect(mockAPI.updateTask).toHaveBeenCalledWith(1, updates);
      expect(result).toEqual({ id: 1, ...updates });
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle task completion status', async () => {
      const mockTask = { id: 1, title: 'Task', completed: true };
      mockAPI.toggleTask.mockResolvedValue(mockTask);

      const result = await taskService.toggleTaskCompletion(1);

      expect(mockAPI.toggleTask).toHaveBeenCalledWith(1);
      expect(result.completed).toBe(true);
    });
  });

  describe('deleteTask', () => {
    it('should delete task', async () => {
      mockAPI.deleteTask.mockResolvedValue();

      await taskService.deleteTask(1);

      expect(mockAPI.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  describe('archiveTask', () => {
    it('should archive task', async () => {
      const mockTask = { id: 1, title: 'Task', archived: true };
      mockAPI.archiveTask.mockResolvedValue(mockTask);

      const result = await taskService.archiveTask(1);

      expect(mockAPI.archiveTask).toHaveBeenCalledWith(1);
      expect(result.archived).toBe(true);
    });
  });

  describe('unarchiveTask', () => {
    it('should unarchive task', async () => {
      const mockTask = { id: 1, title: 'Task', archived: false };
      mockAPI.unarchiveTask.mockResolvedValue(mockTask);

      const result = await taskService.unarchiveTask(1);

      expect(mockAPI.unarchiveTask).toHaveBeenCalledWith(1);
      expect(result.archived).toBe(false);
    });
  });
});