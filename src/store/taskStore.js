import { create } from 'zustand';

export const useTaskStore = create((set) => ({
  taskCount: 0,
  setTaskCount: (count) => set({ taskCount: count }),
}));