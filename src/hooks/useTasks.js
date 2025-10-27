import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockAPI } from '../api/mockAPI';

export function useTasks(search = '', isArchived = false) {
  return useQuery({
    queryKey: ['tasks', search, isArchived],
    queryFn: () => mockAPI.getTasks(search, isArchived),
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const toggleTask = useMutation({
    mutationFn: mockAPI.toggleTask,
    onSuccess: () => {
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