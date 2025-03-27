import { create } from 'zustand';
import api from '../api/api';

const useGradesStore = create((set) => ({
  grades: [],
  isLoading: false,
  error: null,

  // Получение оценок для группы
  fetchGradesByGroup: async (groupId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/api/groups/${groupId}/grades/`);
      set({ grades: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching group grades:', error);
    }
  },

  // Получение оценок для задания
  fetchGradesByAssignment: async (assignmentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/api/assignments/${assignmentId}/grades/`);
      set({ grades: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching grades:', error);
    }
  },

  // Создание новой оценки
  createGrade: async (gradeData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/api/assignments/grades/', gradeData);
      set(state => ({
        grades: [...state.grades, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error creating grade:', error);
      throw error;
    }
  },

  // Обновление оценки
  updateGrade: async (gradeId, gradeData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put(`/api/assignments/grades/${gradeId}/`, gradeData);
      
      // Обновляем состояние после успешного ответа от сервера
      set(state => ({
        grades: state.grades.map(grade => 
          grade._id === gradeId ? { ...grade, ...response.data } : grade
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error updating grade:', error);
      throw error;
    }
  },

  // Удаление оценки
  deleteGrade: async (gradeId) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/api/assignments/grades/${gradeId}/`);
      set(state => ({
        grades: state.grades.filter(g => g._id !== gradeId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error deleting grade:', error);
      throw error;
    }
  },

  // Получение оценок студента
  fetchStudentGrades: async (studentId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/api/assignments/students/${studentId}/grades/`);
      set({ studentGrades: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      console.error('Error fetching student grades:', error);
    }
  },

  // Очистка ошибок
  clearError: () => set({ error: null }),
}));

export default useGradesStore; 