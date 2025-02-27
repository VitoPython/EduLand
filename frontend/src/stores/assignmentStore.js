import { create } from 'zustand'
import api from '../api/api'

export const useAssignmentStore = create((set, get) => ({
  assignments: [],
  currentAssignment: null,
  selectedAssignment: null,
  isLoading: false,
  error: null,

  setAssignments: (assignments) => set({ assignments }),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  setSelectedAssignment: (assignment) => set({ selectedAssignment: assignment }),

  fetchAssignments: async (lessonId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/assignments/lessons/${lessonId}`);
      set({ assignments: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createAssignment: async (lessonId, assignmentData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post(`/assignments/lessons/${lessonId}`, assignmentData);
      set(state => ({
        assignments: [...state.assignments, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateAssignment: async (assignmentId, assignmentData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put(`/assignments/${assignmentId}`, assignmentData);
      set(state => ({
        assignments: state.assignments.map(a => 
          a.id === assignmentId ? response.data : a
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/assignments/${assignmentId}`);
      set(state => ({
        assignments: state.assignments.filter(a => a.id !== assignmentId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchAssignment: async (assignmentId) => {
    if (!assignmentId || assignmentId === 'undefined') {
        set({ error: 'Invalid assignment ID', currentAssignment: null });
        return;
    }

    try {
        set({ isLoading: true, error: null });
        const response = await api.get(`/assignments/${assignmentId}`);
        set({ 
            currentAssignment: response.data,
            isLoading: false 
        });
    } catch (error) {
        set({ 
            error: error.response?.data?.detail || error.message,
            isLoading: false,
            currentAssignment: null
        });
    }
  },

  clearErrors: () => set({ error: null }),
  resetStore: () => set({ assignments: [], currentAssignment: null, isLoading: false, error: null }),

  // Добавляем функцию для получения следующего/предыдущего задания
  getAdjacentAssignments: (currentId) => {
    const assignments = get().assignments;
    const currentIndex = assignments.findIndex(a => a.id === currentId);
    
    return {
      prev: currentIndex > 0 ? assignments[currentIndex - 1] : null,
      next: currentIndex < assignments.length - 1 ? assignments[currentIndex + 1] : null
    };
  }
})) 