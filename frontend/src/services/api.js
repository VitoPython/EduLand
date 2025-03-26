import axios from 'axios';
import useAuthStore from '../store/store';

// Создаем инстанс axios с базовым URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Добавляем интерцептор для добавления токена к каждому запросу
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Добавляем интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().setToken(null);
    }
    return Promise.reject(error);
  }
);

export const gradesApi = {
  fetchGradesByAssignment: (assignmentId) =>
    api.get(`/assignments/${assignmentId}/grades/`),

  fetchGradesByStudent: (studentId) =>
    api.get(`/students/${studentId}/grades/`),

  createGrade: (gradeData) =>
    api.post('/assignments/grades/', gradeData),

  updateGrade: (gradeId, gradeData) =>
    api.put(`/assignments/grades/${gradeId}/`, gradeData),

  deleteGrade: (gradeId) =>
    api.delete(`/assignments/grades/${gradeId}/`),
};

export default api; 