import { create } from 'zustand';
import axios from 'axios';

const useAssignmentSubmitStore = create((set) => ({
  submits: [],
  isLoading: false,
  error: null,

  fetchSubmitsByLesson: async (lessonId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/assignment-submit/lessons/${lessonId}/submits`);
      set({ submits: response.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchSubmitsByAssignment: async (assignmentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/assignment-submit/assignments/${assignmentId}/submits`);
      set({ submits: response.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  createSubmit: async (studentId, lessonId, assignmentId, isSubmitted = true) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `/api/assignment-submit/students/${studentId}/lessons/${lessonId}/assignments/${assignmentId}/submit`,
        { is_submitted: isSubmitted }
      );
      set((state) => ({
        submits: [...state.submits, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateSubmit: async (submitId, submitData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/assignment-submit/submits/${submitId}`, submitData);
      set((state) => ({
        submits: state.submits.map((submit) =>
          submit._id === submitId ? response.data : submit
        ),
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  getStudentAssignmentSubmit: async (studentId, assignmentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `/api/assignment-submit/students/${studentId}/assignments/${assignmentId}/submit`
      );
      return response.data;
    } catch (err) {
      if (err.response?.status !== 404) {
        set({ error: err.message });
      }
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAssignmentSubmitStore; 