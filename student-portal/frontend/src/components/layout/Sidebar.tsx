import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../utils/auth';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ClipboardDocumentListIcon, 
  UserIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:8001';

interface Course {
  id: string;
  title: string;
  description: string;
}

const Sidebar = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
          console.log('No token found, skipping courses fetch');
          setLoading(false);
          return;
        }

        console.log('Fetching courses with token:', token.substring(0, 10) + '...');
        const response = await axios.get(`${API_URL}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Courses response:', response.data);
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Не удалось загрузить курсы');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="h-screen bg-gray-800 text-white w-64 flex flex-col">
      {/* Заголовок приложения */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Портал студента</h1>
      </div>

      {/* Навигация */}
      <nav className="flex-grow overflow-y-auto py-4">
        <ul>
          <li>
            <Link 
              to="/dashboard" 
              className={`flex items-center px-4 py-3 hover:bg-gray-700 ${location.pathname === '/dashboard' ? 'bg-gray-700' : ''}`}
            >
              <AcademicCapIcon className="h-5 w-5 mr-3" />
              <span>Главная</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/profile" 
              className={`flex items-center px-4 py-3 hover:bg-gray-700 ${location.pathname === '/profile' ? 'bg-gray-700' : ''}`}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              <span>Профиль</span>
            </Link>
          </li>

          {/* Раздел курсов */}
          <li className="mt-4">
            <div className="px-4 py-2 text-gray-400 uppercase text-xs font-bold">
              Мои курсы
            </div>
            
            {loading ? (
              <div className="px-4 py-3 text-gray-400">Загрузка курсов...</div>
            ) : error ? (
              <div className="px-4 py-3 text-red-400">{error}</div>
            ) : courses.length === 0 ? (
              <div className="px-4 py-3 text-gray-400">Нет доступных курсов</div>
            ) : (
              <ul>
                {courses.map(course => (
                  <li key={course.id}>
                    <Link 
                      to={`/courses/${course.id}`} 
                      className={`flex items-center px-4 py-3 hover:bg-gray-700 ${location.pathname === `/courses/${course.id}` ? 'bg-gray-700' : ''}`}
                    >
                      <BookOpenIcon className="h-5 w-5 mr-3" />
                      <span>{course.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="mt-4">
            <div className="px-4 py-2 text-gray-400 uppercase text-xs font-bold">
              Материалы
            </div>
            <Link 
              to="/assignments" 
              className={`flex items-center px-4 py-3 hover:bg-gray-700 ${location.pathname === '/assignments' ? 'bg-gray-700' : ''}`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
              <span>Мои задания</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Кнопка выхода */}
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 hover:bg-gray-700 rounded transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 