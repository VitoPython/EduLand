import { create } from 'zustand'
import api from '../api/api'
import { persist } from 'zustand/middleware'

export const useCourseStore = create(
  persist(
    (set) => ({
      courses: [],
      currentCourse: null,
      isLoading: false,
      error: null,

      setCourses: (courses) => set({ courses }),
      setCurrentCourse: (course) => set({ currentCourse: course }),

      fetchCourses: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/courses');
          set({ courses: response.data, error: null });
        } catch (error) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCourse: async (courseId) => {
        set({ isLoading: true });
        try {
          const response = await api.get(`/courses/${courseId}`);
          set({ currentCourse: response.data, error: null });
          return response.data;
        } catch (error) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      createCourse: async (courseData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/courses', courseData);
          set(state => ({
            courses: [...state.courses, response.data],
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

      updateCourse: async (courseId, courseData) => {
        set({ isLoading: true });
        try {
          const response = await api.put(`/courses/${courseId}`, courseData);
          set(state => ({
            courses: state.courses.map(course => 
              course.id === courseId ? response.data : course
            ),
            currentCourse: state.currentCourse?.id === courseId ? response.data : state.currentCourse,
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

      deleteCourse: async (courseId) => {
        set({ isLoading: true });
        try {
          await api.delete(`/courses/${courseId}`);
          set(state => ({
            courses: state.courses.filter(course => course.id !== courseId),
            currentCourse: null,
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
      resetStore: () => set({ courses: [], currentCourse: null, isLoading: false, error: null })
    }),
    {
      name: 'course-storage',
    }
  )
) 