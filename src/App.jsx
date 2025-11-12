import { useState, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import TaskList from './components/TaskList';
import TaskFormModal from './components/TaskFormModal';
import LoadingSpinner from './components/LoadingSpinner';

const ArchiveTaskList = lazy(() => import('./components/ArchiveTaskList'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
      refetchInterval: false,
    },
  },
});

export default function App() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingTask(null);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="todo-container">
          <Header onAddTask={handleAddTask} />
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size={40} />
            </div>
          }>
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
                  <ArchiveTaskList 
                    onEditTask={handleEditTask}
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          
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