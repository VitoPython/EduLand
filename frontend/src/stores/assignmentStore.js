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
      const response = await api.get(`/api/assignments/lessons/${lessonId}`);
      set({ assignments: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching assignments:', error);
    }
  },

  createAssignment: async (lessonId, assignmentData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post(`/api/assignments/lessons/${lessonId}`, assignmentData);
      set(state => ({
        assignments: [...state.assignments, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  updateAssignment: async (assignmentData) => {
    try {
      set({ isLoading: true, error: null });
      const dataToSend = { ...assignmentData };
      delete dataToSend.id;

      const response = await api.put(`/api/assignments/${assignmentData.id}`, dataToSend);
      set(state => ({
        assignments: state.assignments.map(a =>
          a.id === assignmentData.id ? response.data : a
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/api/assignments/${assignmentId}`);
      set(state => ({
        assignments: state.assignments.filter(a => a.id !== assignmentId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  fetchAssignment: async (assignmentId) => {
    if (!assignmentId || assignmentId === 'undefined') {
        console.log('Invalid assignment ID:', assignmentId);
        set({ error: 'Invalid assignment ID', currentAssignment: null });
        return;
    }

    // Проверяем формат ID
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(assignmentId);
    if (!isValidObjectId) {
        console.log('Invalid ObjectId format:', assignmentId);
        set({ error: 'Invalid assignment ID format', currentAssignment: null });
        return;
    }

    try {
        set({ isLoading: true, error: null });
        console.log('Fetching assignment with ID:', assignmentId);
        const response = await api.get(`/api/assignments/${assignmentId}`);
        console.log('Fetched assignment data:', response.data);
        set({ 
            currentAssignment: response.data,
            isLoading: false 
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching assignment:', error);
        set({ 
            error: error.response?.data?.detail || error.message,
            isLoading: false,
            currentAssignment: null
        });
        throw error;
    }
  },

  clearErrors: () => set({ error: null }),
  resetStore: () => set({ assignments: [], currentAssignment: null, isLoading: false, error: null }),

  getAdjacentAssignments: (currentId) => {
    const assignments = get().assignments;
    console.log('Current assignments:', assignments);
    
    if (!assignments.length || !currentId) {
      console.log('No assignments or no currentId');
      return { prev: null, next: null };
    }

    const currentIndex = assignments.findIndex(assignment => {
      const assignmentId = assignment.id || assignment._id;
      return assignmentId === currentId;
    });

    console.log('Found index:', currentIndex);

    return {
      prev: currentIndex > 0 ? assignments[currentIndex - 1] : null,
      next: currentIndex < assignments.length - 1 ? assignments[currentIndex + 1] : null
    };
  }
})) 