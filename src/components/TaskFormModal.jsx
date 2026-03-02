import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import { X, Plus, AlertCircle } from 'lucide-react';
import Portal from './Portal';
import LoadingSpinner from './LoadingSpinner';
import DeadlineSelector from './DeadlineSelector';
import { createTaskSchemaWithDuplicateCheck } from '../schemas/taskSchema';
import { useTaskMutations, useTasks } from '../hooks/useTasks';

const tagOptions = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'learning', label: 'Learning' },
  { value: 'project', label: 'Project' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'react', label: 'React' },
  { value: 'javascript', label: 'JavaScript' },
];

export default function TaskFormModal({ isOpen, onClose, editingTask }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { addTask, updateTask } = useTaskMutations();
  const { data: allTasks = [] } = useTasks('', false);
  const taskSchemaWithValidation = createTaskSchemaWithDuplicateCheck(
    allTasks, 
    editingTask?.id
  );
  
  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchemaWithValidation),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      hasDeadline: false,
      deadline: null,
    }
  });
  
  useEffect(() => {
    if (editingTask) {
      const hasDeadlineValue = !!(editingTask.deadline);
      reset({
        title: editingTask.title,
        description: editingTask.description || '',
        tags: editingTask.tags || [],
        hasDeadline: hasDeadlineValue,
        deadline: editingTask.deadline ? new Date(editingTask.deadline) : null,
      });
    } else {
      reset({
        title: '',
        description: '',
        tags: [],
        hasDeadline: false,
        deadline: null,
      });
    }
    setApiError(null);
  }, [editingTask, reset, isOpen]);
  
  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      const taskData = {
        ...data,
        deadline: data.hasDeadline && data.deadline ? data.deadline.toISOString() : null,
      };
      
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, data: taskData });
      } else {
        await addTask.mutateAsync(taskData);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setApiError(error.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Portal isOpen={isOpen}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition p-0"
          disabled={isSubmitting}
        >
          <X size={24} />
        </button>
      </div>
      
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-600 text-sm">{apiError}</p>
        </div>
      )}
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Title *
        </label>
        <input
          {...register('title')}
          placeholder="Enter task title..."
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
          autoFocus
          disabled={isSubmitting}
          data-testid="task-title-input"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1" data-testid="title-error">
            {errors.title.message}
          </p>
        )}
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          {...register('description')}
          placeholder="Add a description..."
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
          rows="3"
          disabled={isSubmitting}
          data-testid="task-description-input"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (optional)
        </label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={tagOptions}
              isMulti
              placeholder="Select tags..."
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={isSubmitting}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  '&:hover': { borderColor: '#9ca3af' }
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#0d9488',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: 'white',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#0f766e',
                    color: 'white',
                  }
                })
              }}
            />
          )}
        />
        {errors.tags && (
          <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
        )}
      </div>

      <DeadlineSelector
        control={control}
        watch={watch}
        setValue={setValue}
        errors={errors}
        isSubmitting={isSubmitting}
      />
      
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          disabled={isSubmitting}
          data-testid="cancel-button"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit(onFormSubmit)}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded transition flex items-center gap-2 ${
            isSubmitting
              ? 'bg-teal-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
          data-testid="submit-button"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size={20} />
              {editingTask ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <Plus size={20} />
              {editingTask ? 'Update Task' : 'Add Task'}
            </>
          )}
        </button>
      </div>
    </Portal>
  );
}