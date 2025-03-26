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
          set({ courses: response.data, isLoading: false, error: null });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchCourse: async (courseId) => {
        set({ isLoading: true });
        try {
          const response = await api.get(`/courses/${courseId}`);
          const courseData = response.data;
          console.log('Raw course data:', courseData); // Отладка

          // Убедимся, что у курса есть массив уроков
          if (!courseData.lessons) {
            courseData.lessons = [];
          }

          // Преобразуем _id в id для совместимости
          courseData.lessons = Array.isArray(courseData.lessons) 
            ? courseData.lessons.map(lesson => ({
                ...lesson,
                id: lesson._id || lesson.id
            }))
            : [];

          console.log('Processed course data:', courseData); // Отладка
          
          set({ 
            currentCourse: courseData,
            isLoading: false,
            error: null 
          });
          return courseData;
        } catch (error) {
          console.error('Error fetching course:', error); // Отладка
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      createCourse: async (courseData) => {
        set({ isLoading: true });
        try {
          const formattedData = {
            ...courseData,
            duration: Number(courseData.duration),
            price: Number(courseData.price)
          };
          
          const response = await api.post('/courses', formattedData);
          set(state => ({
            courses: [...state.courses, response.data],
            isLoading: false,
            error: null
          }));
          return response.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateCourse: async (courseId, courseData) => {
        set({ isLoading: true });
        try {
          const formattedData = {
            ...courseData,
            duration: Number(courseData.duration),
            price: Number(courseData.price)
          };

          const response = await api.put(`/courses/${courseId}`, formattedData);
          set(state => ({
            courses: state.courses.map(course =>
              course.id === courseId ? response.data : course
            ),
            currentCourse: response.data,
            isLoading: false,
            error: null
          }));
          return response.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteCourse: async (courseId) => {
        set({ isLoading: true });
        try {
          await api.delete(`/courses/${courseId}`);
          set(state => ({
            courses: state.courses.filter(course => course.id !== courseId),
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearErrors: () => set({ error: null }),
      resetStore: () => set({ courses: [], currentCourse: null, isLoading: false, error: null }),
      clearCurrentCourse: () => set({ currentCourse: null })
    }),
    {
      name: 'course-storage',
    }
  )
) 