import { NavLink, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';

export default function Header({ onAddTask }) {
  const taskCount = useTaskStore((state) => state.taskCount);
  const location = useLocation();
  const isArchivePage = location.pathname === '/archive';
  
  return (
    <header className="bg-teal-600 text-white">
      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ToDo App</h1>
          <div className="flex items-center gap-3">
            <div className="bg-teal-700 px-4 py-2 rounded-full">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </div>
            {!isArchivePage && (
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
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-tl rounded-tr transition ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'hover:bg-teal-700'
              }`
            }
          >
            Active Tasks
          </NavLink>
          <NavLink
            to="/archive"
            className={({ isActive }) =>
              `px-4 py-2 rounded-tl rounded-tr transition ${
                isActive
                  ? 'bg-white text-black font-semibold'
                  : 'hover:bg-teal-700'
              }`
            }
          >
            Archive
          </NavLink>
        </nav>
      </div>
    </header>
  );
}