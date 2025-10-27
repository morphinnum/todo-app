import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(3, 'Task must be at least 3 characters').max(100, 'Task too long'),
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.array(z.object({
    value: z.string(),
    label: z.string()
  })).optional()
});