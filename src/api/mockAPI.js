let tasks = [
  { 
    id: 1, 
    title: 'Learn React', 
    description: 'Master React hooks', 
    completed: false, 
    archived: false,
    tags: [{ value: 'learning', label: 'Learning' }, { value: 'react', label: 'React' }]
  },
  { 
    id: 2, 
    title: 'Build ToDo App', 
    description: 'Complete project', 
    completed: false, 
    archived: false,
    tags: [{ value: 'project', label: 'Project' }]
  },
  { 
    id: 3, 
    title: 'Study Zustand', 
    description: 'State management', 
    completed: true, 
    archived: false,
    tags: [{ value: 'learning', label: 'Learning' }]
  },
];

export const mockAPI = {
  getTasks: (search = '', archived = false) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = tasks.filter(t => t.archived === archived);
        if (search) {
          filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
            (t.tags && t.tags.some(tag => tag.label.toLowerCase().includes(search.toLowerCase())))
          );
        }
        resolve(filtered);
      }, 300);
    });
  },
  
  addTask: (task) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask = { 
          ...task, 
          id: Date.now(), 
          completed: false, 
          archived: false,
          tags: task.tags || []
        };
        tasks.push(newTask);
        resolve(newTask);
      }, 1000); // 1 second delay to see loading spinner
    });
  },
  
  updateTask: (id, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
          resolve(tasks[taskIndex]);
        }
        resolve(null);
      }, 1000); // 1 second delay to see loading spinner
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