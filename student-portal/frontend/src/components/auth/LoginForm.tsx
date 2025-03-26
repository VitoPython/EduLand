import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8001';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Пожалуйста, введите имя пользователя и пароль');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Формируем данные для отправки в формате, который ожидает FastAPI
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Сохраняем токен в localStorage
      localStorage.setItem('studentToken', response.data.access_token);
      
      // Перенаправляем пользователя на главную страницу
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Ошибка при входе');
      } else {
        setError('Не удалось подключиться к серверу');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Вход в портал студента</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="form-label">Имя пользователя</label>
          <input
            id="username"
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите имя пользователя"
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="form-label">Пароль</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className={`btn btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Выполняется вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm; 