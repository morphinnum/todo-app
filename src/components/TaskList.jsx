import { useState, useEffect, useOptimistic } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import TaskItem from './TaskItem';
import ConfirmModal from './ConfirmModal';
import { useTasks, useTaskMutations } from '../hooks/useTasks';
import { useTaskStore } from '../store/taskStore';
import { useDebounce } from '../hooks/useDebounce';

export default function TaskList({ isArchived, onEditTask }) {
  const [search, setSearch] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', taskId: null });
  const setTaskCount = useTaskStore((state) => state.setTaskCount);
  
  // Debounce search input
  const debouncedSearch = useDebounce(search, 2000);
  
  // Fetch tasks with React Query
  const { data: taskList = [], isLoading } = useTasks(debouncedSearch, isArchived);
  
  // Get mutations
  const { toggleTask, deleteTask, archiveTask, unarchiveTask } = useTaskMutations();
  
  // Optimistic state for immediate UI updates
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    taskList,
    (currentTasks, updatedTask) => {
      const { type, taskId } = updatedTask;
      
      switch (type) {
        case 'toggle':
          return currentTasks.map(task =>
            task.id === taskId 
              ? { ...task, completed: !task.completed }
              : task
          );
        
        case 'delete':
          return currentTasks.filter(task => task.id !== taskId);
        
        case 'archive':
          return currentTasks.map(task =>
            task.id === taskId 
              ? { ...task, archived: true }
              : task
          );
        
        case 'unarchive':
          return currentTasks.map(task =>
            task.id === taskId 
              ? { ...task, archived: false }
              : task
          );
        
        default:
          return currentTasks;
      }
    }
  );
  
  // Update task count in Zustand
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!isArchived) {
      setTaskCount(optimisticTasks.length);
    } else {
      // Get active tasks count from cache or fetch
      const activeTasks = queryClient.getQueryData(['tasks', '', false]);
      if (activeTasks) {
        setTaskCount(activeTasks.length);
      }
    }
  }, [optimisticTasks, isArchived, setTaskCount, queryClient]);
  
  const handleToggle = async (id) => {
    // Optimistic update
    setOptimisticTasks({ type: 'toggle', taskId: id });
    
    // Actual mutation
    try {
      await toggleTask.mutateAsync(id);
    } catch (error) {
      // If mutation fails, the optimistic update will be reverted automatically
      // when the React Query cache updates and the component re-renders
      console.error('Failed to toggle task:', error);
    }
  };
  
  const handleDelete = (id) => {
    setModalConfig({ isOpen: true, type: 'delete', taskId: id });
  };
  
  const handleArchive = (id) => {
    setModalConfig({ isOpen: true, type: 'archive', taskId: id });
  };

  const handleUnarchive = (id) => {
    setModalConfig({ isOpen: true, type: 'unarchive', taskId: id });
  };
  
  const confirmAction = async () => {
    const { taskId, type } = modalConfig;
    
    // Optimistic update based on action type
    if (type === 'delete') {
      setOptimisticTasks({ type: 'delete', taskId });
    } else if (type === 'archive') {
      setOptimisticTasks({ type: 'archive', taskId });
    } else if (type === 'unarchive') {
      setOptimisticTasks({ type: 'unarchive', taskId });
    }
    
    // Actual mutation
    try {
      if (type === 'delete') {
        await deleteTask.mutateAsync(taskId);
      } else if (type === 'archive') {
        await archiveTask.mutateAsync(taskId);
      } else if (type === 'unarchive') {
        await unarchiveTask.mutateAsync(taskId);
      }
    } catch (error) {
      console.error(`Failed to ${type} task:`, error);
      // The optimistic update will be automatically reverted when React Query
      // refetches the data and the component re-renders
    }
    
    setModalConfig({ isOpen: false, type: '', taskId: null });
  };
  
  const handleClearSearch = () => {
    setSearch('');
  };
  
  return (
    <div className="container bg-white mx-auto px-4 py-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">
        {isArchived ? 'Archived Tasks' : 'Active Tasks'}
      </h2>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
              title="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : optimisticTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {search ? 'No tasks found' : isArchived ? 'No archived tasks' : 'No tasks yet. Click the + button to add one!'}
        </div>
      ) : (
        optimisticTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onEdit={onEditTask}
            isArchived={isArchived}
          />
        ))
      )}
      
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: '', taskId: null })}
        onConfirm={confirmAction}
        title={
          modalConfig.type === 'delete' ? 'Delete Task' : 
          modalConfig.type === 'archive' ? 'Archive Task' : 
          'Unarchive Task'
        }
        message={`Are you sure you want to ${modalConfig.type} this task?`}
      />
    </div>
  );
}