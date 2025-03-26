import { create } from 'zustand';
import api from '../api/api';

export const useEnrollmentStore = create((set) => ({
    enrollments: [],
    isLoading: false,
    error: null,

    // Получить все зачисления для студента
    fetchStudentEnrollments: async (studentId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/enrollments/student/${studentId}`);
            set({ enrollments: response.data, error: null });
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    // Получить все зачисления для курса
    fetchCourseEnrollments: async (courseId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/enrollments/course/${courseId}`);
            set({ enrollments: response.data, error: null });
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    // Зачислить студента на курс
    enrollStudent: async (studentId, courseId) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/enrollments', {
                student_id: studentId,
                course_id: courseId
            });
            set(state => ({
                enrollments: [...state.enrollments, response.data],
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

    // Обновить статус зачисления
    updateEnrollment: async (enrollmentId, updateData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/enrollments/${enrollmentId}`, updateData);
            set(state => ({
                enrollments: state.enrollments.map(enrollment =>
                    enrollment.id === enrollmentId ? response.data : enrollment
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

    // Отменить зачисление
    deleteEnrollment: async (enrollmentId) => {
        set({ isLoading: true });
        try {
            await api.delete(`/enrollments/${enrollmentId}`);
            set(state => ({
                enrollments: state.enrollments.filter(e => e.id !== enrollmentId),
                error: null
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
})); 