import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaskFormModal from '../../components/TaskFormModal';
import * as taskService from '../../services/taskService';

vi.mock('../../services/taskService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        gcTime: 0,
      },
      mutations: { 
        retry: false,
      },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Task Form Integration Tests', () => {
  const mockOnClose = vi.fn();
  const existingTasks = [
    { id: 1, title: 'Existing Task', description: 'Test', archived: false }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    taskService.taskService.getTasks.mockResolvedValue(existingTasks);
    taskService.taskService.createTask.mockResolvedValue({ id: 2, title: 'New Task' });
    taskService.taskService.updateTask.mockResolvedValue({ id: 1, title: 'Updated' });
  });

  it('should not allow empty task title', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskFormModal isOpen={true} onClose={mockOnClose} editingTask={null} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('title-error')).toBeInTheDocument();
    });
  });

  it('should not allow task title less than 3 characters', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskFormModal isOpen={true} onClose={mockOnClose} editingTask={null} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, 'ab');
    
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('title-error')).toHaveTextContent('Task must be at least 3 characters');
    });
  });

  it('should not allow duplicate task titles', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskFormModal isOpen={true} onClose={mockOnClose} editingTask={null} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, 'Existing Task');
    
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('title-error')).toHaveTextContent('A task with this title already exists');
    });
  });

  it('should accept valid task input', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskFormModal isOpen={true} onClose={mockOnClose} editingTask={null} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, 'Brand New Task');
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.queryByTestId('title-error')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });
});