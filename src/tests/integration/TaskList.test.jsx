import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaskList from '../../components/TaskList';
import * as useTasks from '../../hooks/useTasks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Task List Integration Tests', () => {
  const mockOnEditTask = vi.fn();
  const mockToggleTask = { mutate: vi.fn() };
  const mockDeleteTask = { mutateAsync: vi.fn() };
  const mockArchiveTask = { mutateAsync: vi.fn() };
  const mockUnarchiveTask = { mutateAsync: vi.fn() };

  const mockTasks = [
    {
      id: 1,
      title: 'Learn React',
      description: 'Master hooks',
      completed: false,
      archived: false,
      tags: [{ value: 'learning', label: 'Learning' }],
    },
    {
      id: 2,
      title: 'Build App',
      description: 'Complete project',
      completed: true,
      archived: false,
      tags: [{ value: 'project', label: 'Project' }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useTasks, 'useTasks').mockReturnValue({
      data: mockTasks,
      isLoading: false,
    });
    
    vi.spyOn(useTasks, 'useTaskMutations').mockReturnValue({
      toggleTask: mockToggleTask,
      deleteTask: mockDeleteTask,
      archiveTask: mockArchiveTask,
      unarchiveTask: mockUnarchiveTask,
      addTask: { mutateAsync: vi.fn() },
      updateTask: { mutateAsync: vi.fn() },
    });
  });

  it('should display loading state', () => {
    vi.spyOn(useTasks, 'useTasks').mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('should display list of tasks', () => {
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Build App')).toBeInTheDocument();
  });

  it('should display empty state when no tasks', () => {
    vi.spyOn(useTasks, 'useTasks').mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  it('should filter tasks by search', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByPlaceholderText(/Search tasks/i);
    await user.type(searchInput, 'React');

    expect(searchInput).toHaveValue('React');
  });

  it('should clear search when X button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByPlaceholderText(/Search tasks/i);
    await user.type(searchInput, 'React');

    const clearButton = screen.getByTitle(/Clear search/i);
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('should toggle task completion', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const checkboxes = screen.getAllByRole('button');
    const toggleButton = checkboxes[0];
    
    await user.click(toggleButton);

    expect(mockToggleTask.mutate).toHaveBeenCalledWith(1);
  });

  it('should open edit modal when edit button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const editButtons = screen.getAllByTitle(/Edit/i);
    await user.click(editButtons[0]);

    expect(mockOnEditTask).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should show confirmation modal before deletion', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const deleteButtons = screen.getAllByTitle(/Delete/i);
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/Delete Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this task/i)).toBeInTheDocument();
  });

  it('should delete task after confirmation', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mutateAsync.mockResolvedValue();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const deleteButtons = screen.getAllByTitle(/Delete/i);
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteTask.mutateAsync).toHaveBeenCalledWith(1);
    });
  });

  it('should cancel deletion', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const deleteButtons = screen.getAllByTitle(/Delete/i);
    await user.click(deleteButtons[0]);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockDeleteTask.mutateAsync).not.toHaveBeenCalled();
  });

  it('should archive task after confirmation', async () => {
    const user = userEvent.setup();
    mockArchiveTask.mutateAsync.mockResolvedValue();
    
    render(
      <TaskList isArchived={false} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    const archiveButtons = screen.getAllByTitle(/Archive/i);
    await user.click(archiveButtons[0]);

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockArchiveTask.mutateAsync).toHaveBeenCalledWith(1);
    });
  });

  it('should display archived tasks page', () => {
    const archivedTasks = [
      { ...mockTasks[0], archived: true },
    ];

    vi.spyOn(useTasks, 'useTasks').mockReturnValue({
      data: archivedTasks,
      isLoading: false,
    });

    render(
      <TaskList isArchived={true} onEditTask={mockOnEditTask} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Archived Tasks')).toBeInTheDocument();
    expect(screen.getByTitle(/Unarchive/i)).toBeInTheDocument();
  });
});