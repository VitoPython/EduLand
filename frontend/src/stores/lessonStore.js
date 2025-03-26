import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/api';

export const useLessonStore = create(
    persist(
        (set) => ({
            lessons: [],
            currentLesson: null,
            isLoading: false,
            error: null,

            fetchLessons: async (courseId) => {
                set({ isLoading: true });
                try {
                    const response = await api.get(`/lessons/course/${courseId}`);
                    console.log('API response for lessons:', response.data);
                    const lessons = response.data;
                    // Преобразуем _id в id для совместимости с фронтендом
                    const formattedLessons = lessons.map(lesson => ({
                        ...lesson,
                        id: lesson._id || lesson.id
                    }));
                    set({ lessons: formattedLessons, error: null });
                    console.log('Updated lessons state:', formattedLessons);
                } catch (error) {
                    set({ error: error.message });
                } finally {
                    set({ isLoading: false });
                }
            },

            createLesson: async (courseId, lessonData) => {
                set({ isLoading: true });
                try {
                    const response = await api.post(`/courses/${courseId}/lessons`, lessonData);
                    set(state => ({
                        lessons: [...state.lessons, { ...response.data, id: response.data._id }],
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
                            lesson.id === lessonId ? { ...response.data, id: response.data._id } : lesson
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

            deleteLesson: async (lessonId) => {
                set({ isLoading: true });
                try {
                    await api.delete(`/courses/lessons/${lessonId}`);
                    set(state => ({
                        lessons: state.lessons.filter(lesson => lesson.id !== lessonId),
                        error: null
                    }));
                } catch (error) {
                    set({ error: error.message });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            clearCurrentLesson: () => set({ currentLesson: null }),
            clearErrors: () => set({ error: null }),
            resetStore: () => set({ lessons: [], currentLesson: null, isLoading: false, error: null })
        }),
        {
            name: 'lesson-storage', // уникальное имя для хранилища
            getStorage: () => localStorage, // использование localStorage для персистентности
        }
    )
); 