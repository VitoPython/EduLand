import { create } from 'zustand';
import api from '../api/api';

const useUserStore = create((set) => ({
  userInfo: null,
  userRole: null,
  isAdmin: false,
  loading: false,
  error: null,

  // Получение информации о пользователе из базы данных
  fetchUserInfo: async (clerkId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/users/${clerkId}`);
      set({ 
        userInfo: response.data, 
        userRole: response.data.role,
        isAdmin: response.data.role === 'admin',
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Установка роли пользователя (для тестирования)
  setUserRole: (role) => {
    set({ 
      userRole: role,
      isAdmin: role === 'admin'
    });
  },

  // Очистка данных при выходе из системы
  resetUserInfo: () => {
    set({ 
      userInfo: null, 
      userRole: null,
      isAdmin: false
    });
  }
}));

export default useUserStore; 