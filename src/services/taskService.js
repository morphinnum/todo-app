import { mockAPI } from '../api/mockAPI';

export const taskService = {
  async getTasks(filters = {}) {
    const { search = '', archived = false } = filters;
    return await mockAPI.getTasks(search, archived);
  },

  async createTask(taskData) {
    const formattedTask = {
      ...taskData,
      createdAt: new Date().toISOString(),
    };
    return await mockAPI.addTask(formattedTask);
  },

  async updateTask(id, taskData) {
    return await mockAPI.updateTask(id, taskData);
  },

  async archiveTask(id) {
    return await mockAPI.archiveTask(id);
  },

  async unarchiveTask(id) {
    return await mockAPI.unarchiveTask(id);
  },

  async deleteTask(id) {
    return await mockAPI.deleteTask(id);
  },

  async toggleTaskCompletion(id) {
    return await mockAPI.toggleTask(id);
  },
};