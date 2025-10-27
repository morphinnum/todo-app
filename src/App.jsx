import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskFormModal from './components/TaskFormModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export default function App() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="todo-container">
          <Header onAddTask={handleAddTask} />
          <Routes>
            <Route 
              path="/" 
              element={
                <TaskList 
                  isArchived={false}
                  onEditTask={handleEditTask}
                />
              } 
            />
            <Route 
              path="/archive" 
              element={
                <TaskList 
                  isArchived={true}
                  onEditTask={handleEditTask}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <TaskFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setEditingTask(null);
            }}
            editingTask={editingTask}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}