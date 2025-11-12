import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockAPI } from '../api/mockAPI';
import { taskService } from '../services/taskService';

export function useTasks(search = '', isArchived = false) {
  return useQuery({
    queryKey: ['tasks', search, isArchived],
    queryFn: () => taskService.getTasks({ search, archived: isArchived }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,    placeholderData: (previousData) => previousData,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const toggleTask = useMutation({
    mutationFn: taskService.toggleTaskCompletion,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueriesData({ queryKey: ['tasks'] });
      
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;
        return old.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        );
      });
      
      return { previousTasks };
    },

    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: mockAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const archiveTask = useMutation({
    mutationFn: mockAPI.archiveTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const unarchiveTask = useMutation({
    mutationFn: mockAPI.unarchiveTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const addTask = useMutation({
    mutationFn: mockAPI.addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => mockAPI.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    toggleTask,
    deleteTask,
    archiveTask,
    unarchiveTask,
    addTask,
    updateTask,
  };
}