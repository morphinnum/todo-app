import { useState, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Plus, Trash2, Archive, Check, X, ArchiveRestore } from 'lucide-react';

const useTaskStore = create((set) => ({
  taskCount: 0,
  setTaskCount: (count) => set({ taskCount: count }),
}));

const taskSchema = z.object({
  title: z.string().min(3, 'Task must be at least 3 characters').max(100, 'Task too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

const Portal = ({ children, isOpen }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Portal isOpen={isOpen}>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Confirm
        </button>
      </div>
    </Portal>
  );
};

let tasks = [
  { id: 1, title: 'Learn React', description: 'Master React hooks', completed: false, archived: false },
  { id: 2, title: 'Build ToDo App', description: 'Complete project', completed: false, archived: false },
  { id: 3, title: 'Study Zustand', description: 'State management', completed: true, archived: false },
];

const mockAPI = {
  getTasks: (search = '', archived = false) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = tasks.filter(t => t.archived === archived);
        if (search) {
          filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
          );
        }
        resolve(filtered);
      }, 300);
    });
  },
  addTask: (task) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask = { ...task, id: Date.now(), completed: false, archived: false };
        tasks.push(newTask);
        resolve(newTask);
      }, 200);
    });
  },
  deleteTask: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        resolve();
      }, 200);
    });
  },
  toggleTask: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = tasks.find(t => t.id === id);
        if (task) task.completed = !task.completed;
        resolve(task);
      }, 200);
    });
  },
  archiveTask: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = tasks.find(t => t.id === id);
        if (task) task.archived = true;
        resolve(task);
      }, 200);
    });
  },
  unarchiveTask: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = tasks.find(t => t.id === id);
        if (task) task.archived = false;
        resolve(task);
      }, 200);
    });
  },
};

const Router = ({ children }) => {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return children({ route, setRoute });
};

const Link = ({ to, children, className, active }) => {
  const baseClasses = "px-4 py-2 rounded-tl rounded-tr transition";
  const activeClasses = active 
    ? "bg-white text-black font-semibold" 
    : "hover:bg-teal-700";
  
  return (
    <a href={`#${to}`} className={`${baseClasses} ${activeClasses} ${className || ''}`}>
      {children}
    </a>
  );
};

const Header = ({ currentRoute, onAddTask }) => {
  const taskCount = useTaskStore((state) => state.taskCount);
  
  return (
    <header className="bg-teal-600 text-white">
      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ToDo App</h1>
          <div className="flex items-center gap-3">
            <div className="bg-teal-700 px-4 py-2 rounded-full">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </div>
            {currentRoute === '/' && (
                <button
                  onClick={onAddTask}
                  className="bg-teal-700 hover:bg-teal-800 focus:outline-none p-2 rounded-full transition"
                  title="Add new task"
                >
                  <Plus size={24} />
                </button>
              )}
          </div>
        </div>
        <nav className="flex gap-4 mt-4">
          <Link to="/" active={currentRoute === '/'}>Active Tasks</Link>
          <Link to="/archive" active={currentRoute === '/archive'}>Archive</Link>
        </nav>
      </div>
    </header>
  );
};

const TaskFormModal = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
  });
  
  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
    onClose();
  };
  
  return (
    <Portal isOpen={isOpen}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add New Task</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition p-0"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Title *
        </label>
        <input
          {...register('title')}
          placeholder="Enter task title..."
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
          autoFocus
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          {...register('description')}
          placeholder="Add a description..."
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
          rows="3"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
      
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit(onFormSubmit)}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition flex items-center gap-2"
        >
          <Plus size={20} /> Add Task
        </button>
      </div>
    </Portal>
  );
};

const TaskItem = ({ task, onToggle, onDelete, onArchive, onUnarchive, isArchived }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3 flex items-start gap-3">
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-1 flex-shrink-0 w-6 h-6 p-0 rounded border-0 flex items-center justify-center focus:outline-none ${
          task.completed ? 'bg-emerald-500' : 'bg-gray-200'
        }`}
      >
        {task.completed && <Check size={16} className="text-white" />}
      </button>
      <div className="flex-1">
        <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
        )}
      </div>
      <div className="flex gap-1">
        {isArchived ? (
          <button
            onClick={() => onUnarchive(task.id)}
            className="text-green-600 hover:text-green-700 transition"
            title="Unarchive"
          >
            <ArchiveRestore size={20} />
          </button>
        ) : (
          <button
            onClick={() => onArchive(task.id)}
            className="text-yellow-600 hover:text-yellow-700 transition"
            title="Archive"
          >
            <Archive size={20} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-600 hover:text-red-700 transition p-2"
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

const TaskList = ({ isArchived = false, isFormModalOpen, setIsFormModalOpen }) => {
  const [taskList, setTaskList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', taskId: null });
  const setTaskCount = useTaskStore((state) => state.setTaskCount);
  const searchTimeout = useRef(null);
  
  const loadTasks = async (searchTerm = '') => {
    setLoading(true);
    const data = await mockAPI.getTasks(searchTerm, isArchived);
    setTaskList(data);
    if (!isArchived) {
      setTaskCount(data.length);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadTasks();
  }, [isArchived]);
  
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      loadTasks(search);
    }, 2000);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search]);
  
  const handleAddTask = async (data) => {
    await mockAPI.addTask(data);
    loadTasks(search);
  };
  
   const handleToggle = async (id) => {
    setTaskList(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));

    await mockAPI.toggleTask(id);
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
    if (modalConfig.type === 'delete') {
      await mockAPI.deleteTask(modalConfig.taskId);
    } else if (modalConfig.type === 'archive') {
      await mockAPI.archiveTask(modalConfig.taskId);
    } else if (modalConfig.type === 'unarchive') {
      await mockAPI.unarchiveTask(modalConfig.taskId);
    }
    loadTasks(search);
    setModalConfig({ isOpen: false, type: '', taskId: null });
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
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                loadTasks('');
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0"
              title="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
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
            isArchived={isArchived}
          />
        ))
      )}
      
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleAddTask}
      />
      
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
};

export default function App() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  return (
    <Router>
      {({ route }) => {
        const currentRoute = route || '/';
        return (
          <div className="todo-container">
            <Header 
              currentRoute={currentRoute} 
              onAddTask={() => setIsFormModalOpen(true)}
            />
            <TaskList 
              isArchived={currentRoute === '/archive'} 
              isFormModalOpen={isFormModalOpen}
              setIsFormModalOpen={setIsFormModalOpen}
            />
          </div>
        );
      }}
    </Router>
  );
}