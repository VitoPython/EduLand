import { create } from 'zustand'
import api from '../api/api'

export const useAssignmentStore = create((set) => ({
  assignments: [],
  currentAssignment: null,
  isLoading: false,
  error: null,

  setAssignments: (assignments) => set({ assignments }),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  fetchAssignments: async (lessonId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/courses/lessons/${lessonId}`);
      set({ assignments: response.data.assignments || [], error: null });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createAssignment: async (lessonId, assignmentData) => {
    set({ isLoading: true });
    try {
      const response = await api.post(`/courses/lessons/${lessonId}/assignments`, assignmentData);
      set(state => ({
        assignments: [...state.assignments, response.data],
        error: null
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAssignment: async (assignmentId, assignmentData) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/courses/assignments/${assignmentId}`, assignmentData);
      set(state => ({
        assignments: state.assignments.map(assignment => 
          assignment.id === assignmentId ? response.data : assignment
        ),
        error: null
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAssignment: async (assignmentId) => {
    set({ isLoading: true });
    try {
      await api.delete(`/courses/assignments/${assignmentId}`);
      set(state => ({
        assignments: state.assignments.filter(assignment => assignment.id !== assignmentId),
        error: null
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAssignment: async (assignmentId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/courses/assignments/${assignmentId}`);
      set({ currentAssignment: response.data, error: null });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearErrors: () => set({ error: null }),
  resetStore: () => set({ assignments: [], currentAssignment: null, isLoading: false, error: null })
})) 