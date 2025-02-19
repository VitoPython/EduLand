import { create } from 'zustand';
import api from '../api/api';

export const useLessonStore = create((set) => ({
    lessons: [],
    currentLesson: null,
    isLoading: false,
    error: null,

    setLessons: (lessons) => set({ lessons }),
    setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

    fetchLessons: async (courseId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/courses/${courseId}`);
            set({ lessons: response.data.lessons || [], error: null });
        } catch (error) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchLesson: async (lessonId) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/courses/lessons/${lessonId}`);
            set({ currentLesson: response.data, error: null });
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    createLesson: async (courseId, lessonData) => {
        set({ isLoading: true });
        try {
            const response = await api.post(`/courses/${courseId}/lessons`, lessonData);
            set(state => ({
                lessons: [...state.lessons, response.data],
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

    updateLesson: async (lessonId, lessonData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/courses/lessons/${lessonId}`, lessonData);
            set(state => ({
                lessons: state.lessons.map(lesson => 
                    lesson.id === lessonId ? response.data : lesson
                ),
                currentLesson: state.currentLesson?.id === lessonId ? response.data : state.currentLesson,
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

    deleteLesson: async (lessonId) => {
        set({ isLoading: true });
        try {
            await api.delete(`/courses/lessons/${lessonId}`);
            set(state => ({
                lessons: state.lessons.filter(lesson => lesson.id !== lessonId),
                currentLesson: null,
                error: null
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    clearErrors: () => set({ error: null }),
    resetStore: () => set({ lessons: [], currentLesson: null, isLoading: false, error: null })
})); 