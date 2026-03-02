import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(3, 'Task must be at least 3 characters').max(100, 'Task too long').trim(),
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.array(z.object({
    value: z.string(),
    label: z.string()
  }))
  .min(1, 'Please select at least one tag')
  .max(3, 'Maximum 3 tags allowed')
  .optional(),
  hasDeadline: z.boolean().optional(),
  deadline: z.date().nullable().optional(),
}).refine(
  (data) => {
    if (data.hasDeadline && !data.deadline) {
      return false;
    }
    return true;
  },
  {
    message: 'Please select a deadline date',
    path: ['deadline'],
  }
);

export const createTaskSchemaWithDuplicateCheck = (existingTasks, editingTaskId = null) => {
  return taskSchema.refine(
    (data) => {
      const isDuplicate = existingTasks.some(
        task => 
          task.title.toLowerCase() === data.title.toLowerCase() && 
          task.id !== editingTaskId
      );
      return !isDuplicate;
    },
    {
      message: 'A task with this title already exists',
      path: ['title'],
    }
  );
};