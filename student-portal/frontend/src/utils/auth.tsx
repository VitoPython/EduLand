import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8001';

// Настраиваем axios для работы с FastAPI
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// Перехватчик для добавления токена к запросам
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Определяем типы данных
interface Student {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  course_ids: string[];
}

interface AuthContextType {
  student: Student | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Создаем контекст для аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Компонент-провайдер аутентификации
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверяем аутентификацию при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('studentToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/auth/me');
        console.log('Auth check response:', response.data);
        setStudent(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('studentToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Функция для входа
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Используем URLSearchParams для отправки данных
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const loginResponse = await axios.post(`${API_URL}/auth/login`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (loginResponse.data && loginResponse.data.access_token) {
        const token = loginResponse.data.access_token;
        localStorage.setItem('studentToken', token);
        
        // После успешного логина получаем данные пользователя
        const userResponse = await axiosInstance.get('/auth/me');
        console.log('User data response:', userResponse.data);

        setStudent(userResponse.data);
        setIsAuthenticated(true);
      } else {
        setError('Неверный ответ от сервера');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Ошибка при входе');
      } else {
        setError('Не удалось подключиться к серверу');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода
  const logout = () => {
    localStorage.removeItem('studentToken');
    setStudent(null);
    setIsAuthenticated(false);
  };

  const value = {
    student,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Компонент для защиты маршрутов
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}; 