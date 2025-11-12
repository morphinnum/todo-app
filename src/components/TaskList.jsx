import { useState, useEffect, useCallback, useTransition } from 'react';
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
  const [isPending, startTransition] = useTransition();
  
  const debouncedSearch = useDebounce(search, 2000);
  const { data: taskList = [], isLoading } = useTasks(debouncedSearch, isArchived);
  const { toggleTask, deleteTask, archiveTask, unarchiveTask } = useTaskMutations();
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!isArchived) {
      setTaskCount(taskList.length);
    } else {
      const activeTasks = queryClient.getQueryData(['tasks', '', false]);
      if (activeTasks) {
        setTaskCount(activeTasks.length);
      }
    }
  }, [taskList, isArchived, setTaskCount, queryClient]);
  
  const handleToggle = useCallback((id) => {
    startTransition(() => {
      toggleTask.mutate(id);
    });
  }, [toggleTask]);

  const handleDelete = useCallback((id) => {
    setModalConfig({ isOpen: true, type: 'delete', taskId: id });
  }, []);

  const handleArchive = useCallback((id) => {
    setModalConfig({ isOpen: true, type: 'archive', taskId: id });
  }, []);

  const handleUnarchive = useCallback((id) => {
    setModalConfig({ isOpen: true, type: 'unarchive', taskId: id });
  }, []);
  
  const confirmAction = async () => {
    const { taskId, type } = modalConfig;
    
    startTransition(async () => {
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
      }
    });
    
    setModalConfig({ isOpen: false, type: '', taskId: null });
  };
  
  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);
  
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
      
      {isLoading || isPending ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : taskList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {search ? 'No tasks found' : isArchived ? 'No archived tasks' : 'No tasks yet. Click the + button to add one!'}
        </div>
      ) : (
        taskList.map((task) => (
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