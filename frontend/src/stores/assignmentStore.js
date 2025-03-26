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

  updateAssignment: async (assignmentData) => {
    try {
      set({ isLoading: true, error: null });
      if (!assignmentData?.id) {
        const error = new Error('Assignment ID is required');
        error.code = 'MISSING_ID';
        throw error;
      }

      // Проверяем обязательные поля
      if (!assignmentData.title?.trim()) {
        const error = new Error('Title is required');
        error.code = 'MISSING_TITLE';
        throw error;
      }

      const dataToSend = {
        title: assignmentData.title.trim(),
        description: assignmentData.description || '',
        code_editor: assignmentData.code_editor || ''
      };

      const response = await api.put(`/assignments/${assignmentData.id}`, dataToSend);
      
      set(state => ({
        assignments: state.assignments.map(a => 
          a.id === assignmentData.id ? response.data : a
        ),
        currentAssignment: state.currentAssignment?.id === assignmentData.id 
          ? response.data 
          : state.currentAssignment,
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.code ? error.message : (error.response?.data?.detail || 'Failed to update assignment'), 
        isLoading: false 
      });
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
        console.log('Invalid assignment ID:', assignmentId);
        set({ error: 'Invalid assignment ID', currentAssignment: null });
        return;
    }

    try {
        set({ isLoading: true, error: null });
        console.log('Fetching assignment:', assignmentId);
        const response = await api.get(`/assignments/${assignmentId}`);
        console.log('Fetched assignment data:', response.data);
        set({ 
            currentAssignment: response.data,
            isLoading: false 
        });
    } catch (error) {
        console.error('Error fetching assignment:', error);
        set({ 
            error: error.response?.data?.detail || error.message,
            isLoading: false,
            currentAssignment: null
        });
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