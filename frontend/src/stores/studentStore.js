import { create } from 'zustand';
import api from '../api/api';

export const useStudentStore = create((set) => ({
    students: [],
    currentStudent: null,
    isLoading: false,
    error: null,

    fetchStudents: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/students');
            set({ students: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchStudent: async (studentId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/students/${studentId}`);
            set({ currentStudent: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    clearCurrentStudent: () => set({ currentStudent: null }),

    deleteStudent: async (studentId) => {
        set({ isLoading: true });
        try {
            await api.delete(`/students/${studentId}`);
            set(state => ({
                students: state.students.filter(student => student.id !== studentId),
                isLoading: false,
                error: null
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateStudent: async (studentId, studentData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/students/${studentId}`, studentData);
            set(state => ({
                students: state.students.map(student =>
                    student.id === studentId ? response.data : student
                ),
                currentStudent: response.data,
                isLoading: false,
                error: null
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
})); 