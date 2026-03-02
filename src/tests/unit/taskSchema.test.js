import { describe, it, expect } from 'vitest';
import { taskSchema, createTaskSchemaWithDuplicateCheck } from '../../schemas/taskSchema';

describe('Task Schema Validation - Unit Tests', () => {
  describe('Title validation', () => {
    it('should reject empty title', () => {
      const result = taskSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].path[0]).toBe('title');
    });

    it('should reject title less than 3 characters', () => {
      const result = taskSchema.safeParse({ title: 'ab' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Task must be at least 3 characters');
    });

    it('should accept valid title', () => {
      const result = taskSchema.safeParse({ title: 'Valid Task' });
      expect(result.success).toBe(true);
    });

    it('should reject title longer than 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = taskSchema.safeParse({ title: longTitle });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Task too long');
    });
  });

  describe('Duplicate task validation', () => {
    const existingTasks = [
      { id: 1, title: 'Learn React', description: 'Test' },
      { id: 2, title: 'Build App', description: 'Test' },
    ];

    it('should reject duplicate task title', () => {
      const schema = createTaskSchemaWithDuplicateCheck(existingTasks);
      const result = schema.safeParse({ title: 'Learn React' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('A task with this title already exists');
    });

    it('should reject duplicate title (case-insensitive)', () => {
      const schema = createTaskSchemaWithDuplicateCheck(existingTasks);
      const result = schema.safeParse({ title: 'LEARN REACT' });
      expect(result.success).toBe(false);
    });

    it('should allow same title when editing the same task', () => {
      const schema = createTaskSchemaWithDuplicateCheck(existingTasks, 1);
      const result = schema.safeParse({ title: 'Learn React' });
      expect(result.success).toBe(true);
    });

    it('should accept unique task title', () => {
      const schema = createTaskSchemaWithDuplicateCheck(existingTasks);
      const result = schema.safeParse({ title: 'New Unique Task' });
      expect(result.success).toBe(true);
    });
  });

  describe('Deadline validation', () => {
    it('should require deadline when hasDeadline is true', () => {
      const result = taskSchema.safeParse({
        title: 'Task with deadline',
        hasDeadline: true,
        deadline: null,
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Please select a deadline date');
    });

    it('should accept task with deadline', () => {
      const result = taskSchema.safeParse({
        title: 'Task with deadline',
        hasDeadline: true,
        deadline: new Date('2025-12-31'),
      });
      expect(result.success).toBe(true);
    });

    it('should accept task without deadline', () => {
      const result = taskSchema.safeParse({
        title: 'Task without deadline',
        hasDeadline: false,
        deadline: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Description validation', () => {
    it('should accept optional description', () => {
      const result = taskSchema.safeParse({ title: 'Task' });
      expect(result.success).toBe(true);
    });

    it('should reject description longer than 500 characters', () => {
      const longDescription = 'a'.repeat(501);
      const result = taskSchema.safeParse({
        title: 'Task',
        description: longDescription,
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Description too long');
    });
  });
});