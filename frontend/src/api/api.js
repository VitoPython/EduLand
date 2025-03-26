import axios from "axios";

// Создаем инстанс axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Добавим логирование для отладки
api.interceptors.request.use(request => {
  if (request.url) {
    // Убедимся, что ID в URL корректно закодирован
    request.url = request.url.replace(/\/([^\/]+)\//, (match, id) => {
      return `/${encodeURIComponent(id)}/`;
    });
  }
  console.log('Starting Request', request);
  return request;
});

api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
}, error => {
  console.error('API Error:', error);
  if (error.response?.status === 401) {
    // Перенаправляем на страницу входа при ошибке аутентификации
    window.location.href = '/sign-in';
  }
  return Promise.reject(error);
});

// Функция для настройки интерцепторов
export const setupInterceptors = (getToken, session) => {
  // Удаляем предыдущие интерцепторы
  api.interceptors.request.eject(api.interceptors.request.handlers[0]);
  api.interceptors.response.eject(api.interceptors.response.handlers[0]);

  // Добавляем интерцептор для запросов
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Добавляем интерцептор для ответов
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Если получили 401 и это не повторный запрос
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Пробуем получить новый токен
          const token = await session.refresh();
          
          // Обновляем заголовок с новым токеном
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Повторяем исходный запрос с новым токеном
          return api(originalRequest);
        } catch (refreshError) {
          // Если не удалось обновить токен, перенаправляем на страницу входа
          window.location.href = '/sign-in';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api; 