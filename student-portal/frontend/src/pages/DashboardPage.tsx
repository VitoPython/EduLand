import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/auth';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8001';

interface Course {
  id: string;
  title: string;
  description: string;
  lessons_count?: number;
  completed_lessons_count?: number;
}

interface Grade {
  id: string;
  student_id: string;
  assignment_id: string;
  grade: number;
  created_at: string;
  updated_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const bounceVariants = {
  initial: { scale: 0.8, opacity: 0, y: 20 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

// Функция для расчета суммы оценок
const calculateTotalScore = (grades: Grade[]): number => {
  return grades.reduce((total, grade) => total + grade.grade, 0);
};

const DashboardPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradesLoading, setGradesLoading] = useState(true);
  const { student } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) {
          console.log('No token found in DashboardPage, skipping courses fetch');
          setLoading(false);
          return;
        }

        console.log('DashboardPage: Fetching courses with token:', token.substring(0, 10) + '...');
        const response = await axios.get(`${API_URL}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('DashboardPage: Courses response:', response.data);
        setCourses(response.data);
      } catch (err) {
        console.error('DashboardPage: Error fetching courses:', err);
        setError('Не удалось загрузить курсы');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token || !student?.id) {
          console.log('No token or student ID found, skipping grades fetch');
          setGradesLoading(false);
          return;
        }

        console.log('DashboardPage: Fetching grades for student:', student.id);
        const response = await axios.get(`${API_URL}/grades/student/${student.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('DashboardPage: Grades response:', response.data);
        setGrades(response.data);
      } catch (err) {
        console.error('DashboardPage: Error fetching grades:', err);
      } finally {
        setGradesLoading(false);
      }
    };

    fetchGrades();
  }, [student?.id]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}/lessons`);
  };

  // Вычисляем сумму оценок
  const totalScore = calculateTotalScore(grades);
  
  // Новые пороговые значения для уровней
  const LEVEL_THRESHOLDS = {
    BEGINNER: 0,     // Новичок - всегда доступен
    STUDENT: 10,     // Ученик - от 10 баллов
    EXPLORER: 100,   // Исследователь - от 100 баллов
    MASTER: 500,     // Мастер кода - от 500 баллов
    GURU: 3200       // Гуру - от 3200 баллов
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[600px]">
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { duration: 0.5 }
            }}
          >
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"></div>
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                animate={{ 
                  rotate: 360,
                  transition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              >
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </motion.div>
            </div>
            <p className="text-indigo-600 font-medium mt-4 text-center">Загружаем твои курсы...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800">Произошла ошибка</h3>
                <p className="mt-1 text-red-700">{error}</p>
                <button 
                  className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Приветствие */}
        <motion.div 
          className="relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl" />
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-blue-100 shadow-xl overflow-hidden">
            {/* Декоративные элементы в стиле кода и программирования */}
            <div className="absolute right-0 top-0 -mt-12 -mr-12 opacity-10">
              <svg className="w-64 h-64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3M3 16v3a2 2 0 002 2h3m8 0h3a2 2 0 002-2v-3" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute left-0 bottom-0 -ml-10 -mb-10 opacity-10">
              <svg className="w-48 h-48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="#805AD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className="relative p-8">
              <div className="flex flex-col md:flex-row items-center md:space-x-8">
                <motion.div 
                  className="relative mb-6 md:mb-0"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 } 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-70 animate-pulse" />
                  <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <motion.div
                      animate={{ 
                        y: [0, -5, 0],
                        transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                      }}
                    >
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
                
                <div className="text-center md:text-left">
                  <motion.h1 
                    className="text-3xl md:text-4xl font-bold" 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                  >
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Привет, {student?.first_name || 'Юный программист'}! 👋
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    className="mt-4 text-gray-600 max-w-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                  >
                    Добро пожаловать в твой личный кабинет! Здесь ты найдешь все свои курсы по программированию, 
                    задания и проекты. Готов стать настоящим разработчиком?
                  </motion.p>
                  
                  <motion.div 
                    className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                  >
                    {courses.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 flex items-center space-x-2"
                        onClick={() => navigate(`/courses/${courses[0].id}/lessons`)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Начать обучение</span>
                      </motion.button>
                    )}
                    
                    
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Мои курсы */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl" />
          <div className="relative rounded-3xl border border-indigo-100/40 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
            {/* Фоновые декоративные элементы */}
            <div className="absolute right-0 bottom-0 opacity-5">
              <svg className="w-64 h-64" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path d="M12 6.25278V19.2528M12 6.25278L6.75 10.5028M12 6.25278L17.25 10.5028M12 19.2528L6.75 14.9028M12 19.2528L17.25 14.9028M7.5 3.75L16.5 3.75M7.5 20.25H16.5" 
                  stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className="p-8">
              <motion.div 
                className="flex items-center mb-8"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { delay: 0.4 } }}
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Мои курсы по программированию
                  </h2>
                  <p className="text-gray-500">Выбери курс и начни свое путешествие в мир кода!</p>
                </div>
              </motion.div>

              {courses.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { delay: 0.5 } }}
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 mb-6"
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      transition: { repeat: Infinity, duration: 5, ease: "easeInOut" }
                    }}
                  >
                    <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M8 16l2.879-2.879m0 0a3 3 0 104.242-4.242 3 3 0 00-4.242 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-3">Пока нет доступных курсов</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Как только ты будешь записан на свой первый курс по программированию, 
                    он появится здесь и ты сможешь начать свое приключение!
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      variants={bounceVariants}
                      whileHover="hover"
                      className="group"
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <div className="relative bg-white rounded-2xl border border-indigo-100 shadow-lg overflow-hidden cursor-pointer h-full">
                        {/* Фон карточки */}
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white"></div>
                        
                        {/* Декоративная графика */}
                        <div className="absolute top-0 right-0 p-2">
                          <div className="text-indigo-600/10">
                            <svg className="w-20 h-20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="relative p-6 flex flex-col h-full">
                          {/* Иконка курса */}
                          <div className="mb-4">
                            <motion.div 
                              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 
                                        flex items-center justify-center shadow-lg shadow-indigo-500/20"
                              whileHover={{ rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            >
                              {/* Динамические иконки для разных курсов */}
                              {course.title.toLowerCase().includes('python') ? (
                                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 5C9.293 5 7.1 6.534 7.1 8.5V11H5.6v5h9.8v-5h-1.5V8.5c0-1.006 1.01-2 2.1-2s2.1.994 2.1 2V13h1.5V8.5c0-1.966-2.193-3.5-4.9-3.5zm-3 7.5h3v1h-3v-1z" />
                                  <path d="M12 19c2.707 0 4.9-1.534 4.9-3.5V13h1.5V8h-9.8v5h1.5v2.5c0 1.006-1.01 2-2.1 2s-2.1-.994-2.1-2V11h-1.5v4.5c0 1.966 2.193 3.5 4.9 3.5zm3-7.5h-3v-1h3v1z" />
                                </svg>
                              ) : course.title.toLowerCase().includes('java') ? (
                                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18 6h-7.14c-.45 0-.89.19-1.2.52L4.52 11.4c-.29.29-.52.65-.52 1.06 0 .41.23.77.52 1.06l5.13 4.88c.31.33.75.52 1.2.52H18c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2z" />
                                  <path d="M15 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                              ) : course.title.toLowerCase().includes('web') ? (
                                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                              ) : (
                                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </motion.div>
                          </div>
                          
                          {/* Содержимое карточки */}
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors pr-10">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 line-clamp-2 mb-4 pr-6">{course.description}</p>
                          </div>
                          
                          {/* Прогресс и статистика */}
                          <div className="mt-2">
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" 
                                style={{ width: `${((course.completed_lessons_count || 0) / (course.lessons_count || 1)) * 100}%` }}>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Прогресс</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm font-medium text-indigo-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>{course.lessons_count || '?'} уроков</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Кнопка "Начать" - переместили вправо вверх */}
                          <motion.div 
                            className="absolute top-6 right-6"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Начать обучение - этот блок оставляем только если есть курсы */}
        {courses.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-3xl" />
            <div className="relative rounded-3xl border border-indigo-100 shadow-xl overflow-hidden">
              {/* Фоновые элементы */}
              <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10">
                <svg className="w-64 h-64 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 7l5 5-5 5M5 7l5 5-5 5" />
                </svg>
              </div>
              
              <div className="relative p-8 bg-gradient-to-br from-indigo-100/50 via-white/50 to-blue-100/50 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center md:space-x-8">
                  <motion.div 
                    className="mb-6 md:mb-0 relative"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: 0.6, duration: 0.5 } 
                    }}
                    whileHover={{ 
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-70" />
                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <svg className="w-12 h-12 md:w-14 md:h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </motion.div>
                  
                  <div className="text-center md:text-left">
                    <motion.h2 
                      className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                    >
                      Начни свое путешествие в мир кода!
                    </motion.h2>
                    
                    <motion.p 
                      className="mt-2 text-gray-600 max-w-2xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
                    >
                      Программирование — это как суперсила! Ты сможешь создавать игры, 
                      веб-сайты, приложения и многое другое. Выбери свой первый курс и начни 
                      учиться прямо сейчас!
                    </motion.p>
                    
                    <motion.div 
                      className="mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.9 } }}
                    >
                      <motion.button
                        className="inline-flex items-center px-6 py-3 rounded-xl 
                                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium 
                                  shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 
                                  transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCourseClick(courses[0].id)}
                      >
                        <span>Начать обучение</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Достижения и мотивация - переработано под roadmap с суммой оценок */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl" />
          <div className="relative rounded-3xl border border-purple-100 shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
            <div className="p-8">
              <motion.div 
                className="flex items-center mb-8"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { delay: 1.0 } }}
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4 shadow-lg shadow-purple-500/20">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Твои достижения в обучении
                  </h2>
                  <p className="text-gray-500">
                    {gradesLoading 
                      ? "Загрузка твоих оценок..."
                      : `У тебя уже ${totalScore} ${totalScore === 1 ? 'балл' : 
                        totalScore >= 2 && totalScore <= 4 ? 'балла' : 
                        totalScore >= 5 && totalScore <= 20 ? 'баллов' : 
                        totalScore % 10 === 1 && totalScore % 100 !== 11 ? 'балл' : 
                        totalScore % 10 >= 2 && totalScore % 10 <= 4 && (totalScore % 100 < 12 || totalScore % 100 > 14) ? 'балла' : 'баллов'}! Продолжай в том же духе!`
                    }
                  </p>
                </div>
              </motion.div>
              
              {/* Roadmap достижений */}
              <div className="relative mb-12 px-4">
                <div className="absolute left-0 right-0 h-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full"></div>
                
                <div className="relative z-10 flex justify-between">
                  {/* 1-й уровень - Новичок (разблокирован всегда) */}
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 1.1 } }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-purple-800 mt-2">Новичок</span>
                  </motion.div>
                  
                  {/* 2-й уровень - Ученик (от 10 баллов) */}
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 1.2 } }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${totalScore >= LEVEL_THRESHOLDS.STUDENT 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                      : 'bg-gray-300'}`}
                    >
                      {totalScore >= LEVEL_THRESHOLDS.STUDENT ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-xs">10</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${totalScore >= LEVEL_THRESHOLDS.STUDENT ? 'text-purple-800' : 'text-gray-500'}`}>Ученик</span>
                  </motion.div>
                  
                  {/* 3-й уровень - Исследователь (от 100 баллов) */}
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 1.3 } }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${totalScore >= LEVEL_THRESHOLDS.EXPLORER 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                      : 'bg-gray-300'}`}
                    >
                      {totalScore >= LEVEL_THRESHOLDS.EXPLORER ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-xs">100</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${totalScore >= LEVEL_THRESHOLDS.EXPLORER ? 'text-purple-800' : 'text-gray-500'}`}>Исследователь</span>
                  </motion.div>
                  
                  {/* 4-й уровень - Мастер кода (от 500 баллов) */}
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 1.4 } }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${totalScore >= LEVEL_THRESHOLDS.MASTER 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                      : 'bg-gray-300'}`}
                    >
                      {totalScore >= LEVEL_THRESHOLDS.MASTER ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-xs">500</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${totalScore >= LEVEL_THRESHOLDS.MASTER ? 'text-purple-800' : 'text-gray-500'}`}>Мастер кода</span>
                  </motion.div>
                  
                  {/* 5-й уровень - Гуру (от 3200 баллов) */}
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 1.5 } }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${totalScore >= LEVEL_THRESHOLDS.GURU 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                      : 'bg-gray-300'}`}
                    >
                      {totalScore >= LEVEL_THRESHOLDS.GURU ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-xs">3200</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${totalScore >= LEVEL_THRESHOLDS.GURU ? 'text-purple-800' : 'text-gray-500'}`}>Гуру</span>
                  </motion.div>
                </div>
                
                {/* Прогресс-бар до следующего уровня */}
                <div className="absolute left-0 h-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                     style={{ 
                       width: totalScore >= LEVEL_THRESHOLDS.GURU 
                         ? '100%' 
                         : totalScore >= LEVEL_THRESHOLDS.MASTER 
                           ? '75%' 
                           : totalScore >= LEVEL_THRESHOLDS.EXPLORER 
                             ? '50%' 
                             : totalScore >= LEVEL_THRESHOLDS.STUDENT 
                               ? '25%' 
                               : '12.5%'
                     }}
                ></div>
              </div>
              
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Значок 1 - Новичок (всегда разблокирован) */}
                <motion.div 
                  className="relative bg-white rounded-2xl border border-purple-100 p-4 shadow-lg text-center"
                  variants={bounceVariants}
                  whileHover="hover"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white rounded-2xl"></div>
                  <div className="relative">
                    <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-purple-900">Новичок</h3>
                    <p className="text-xs text-gray-500 mt-1">Начало пути!</p>
                  </div>
                </motion.div>
                
                {/* Значок 2 - Ученик (от 10 баллов) */}
                <motion.div 
                  className={`relative bg-white rounded-2xl border border-purple-100 p-4 shadow-lg text-center ${totalScore < LEVEL_THRESHOLDS.STUDENT ? 'opacity-70' : ''}`}
                  variants={bounceVariants}
                  whileHover={totalScore >= LEVEL_THRESHOLDS.STUDENT ? "hover" : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white rounded-2xl"></div>
                  <div className="relative">
                    <div className={`mx-auto mb-3 h-16 w-16 rounded-full flex items-center justify-center shadow-md ${
                      totalScore >= LEVEL_THRESHOLDS.STUDENT 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className={`font-bold ${totalScore >= LEVEL_THRESHOLDS.STUDENT ? 'text-purple-900' : 'text-gray-400'}`}>Ученик</h3>
                    <p className={`text-xs mt-1 ${totalScore >= LEVEL_THRESHOLDS.STUDENT ? 'text-gray-500' : 'text-gray-400'}`}>
                      {totalScore >= LEVEL_THRESHOLDS.STUDENT ? 'Набрал 10 баллов!' : 'Набери 10 баллов'}
                    </p>
                  </div>
                </motion.div>
                
                {/* Значок 3 - Исследователь (от 100 баллов) */}
                <motion.div 
                  className={`relative bg-white rounded-2xl border border-purple-100 p-4 shadow-lg text-center ${totalScore < LEVEL_THRESHOLDS.EXPLORER ? 'opacity-70' : ''}`}
                  variants={bounceVariants}
                  whileHover={totalScore >= LEVEL_THRESHOLDS.EXPLORER ? "hover" : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white rounded-2xl"></div>
                  <div className="relative">
                    <div className={`mx-auto mb-3 h-16 w-16 rounded-full flex items-center justify-center shadow-md ${
                      totalScore >= LEVEL_THRESHOLDS.EXPLORER 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className={`font-bold ${totalScore >= LEVEL_THRESHOLDS.EXPLORER ? 'text-purple-900' : 'text-gray-400'}`}>Исследователь</h3>
                    <p className={`text-xs mt-1 ${totalScore >= LEVEL_THRESHOLDS.EXPLORER ? 'text-gray-500' : 'text-gray-400'}`}>
                      {totalScore >= LEVEL_THRESHOLDS.EXPLORER ? 'Набрал 100 баллов!' : 'Набери 100 баллов'}
                    </p>
                  </div>
                </motion.div>
                
                {/* Значок 4 - Мастер кода (от 500 баллов) */}
                <motion.div 
                  className={`relative bg-white rounded-2xl border border-purple-100 p-4 shadow-lg text-center ${totalScore < LEVEL_THRESHOLDS.MASTER ? 'opacity-70' : ''}`}
                  variants={bounceVariants}
                  whileHover={totalScore >= LEVEL_THRESHOLDS.MASTER ? "hover" : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white rounded-2xl"></div>
                  <div className="relative">
                    <div className={`mx-auto mb-3 h-16 w-16 rounded-full flex items-center justify-center shadow-md ${
                      totalScore >= LEVEL_THRESHOLDS.MASTER 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className={`font-bold ${totalScore >= LEVEL_THRESHOLDS.MASTER ? 'text-purple-900' : 'text-gray-400'}`}>Мастер кода</h3>
                    <p className={`text-xs mt-1 ${totalScore >= LEVEL_THRESHOLDS.MASTER ? 'text-gray-500' : 'text-gray-400'}`}>
                      {totalScore >= LEVEL_THRESHOLDS.MASTER ? 'Набрал 500 баллов!' : 'Набери 500 баллов'}
                    </p>
                  </div>
                </motion.div>
                
                {/* Значок 5 - Гуру (от 3200 баллов) */}
                <motion.div 
                  className={`relative bg-white rounded-2xl border border-purple-100 p-4 shadow-lg text-center ${totalScore < LEVEL_THRESHOLDS.GURU ? 'opacity-70' : ''}`}
                  variants={bounceVariants}
                  whileHover={totalScore >= LEVEL_THRESHOLDS.GURU ? "hover" : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white rounded-2xl"></div>
                  <div className="relative">
                    <div className={`mx-auto mb-3 h-16 w-16 rounded-full flex items-center justify-center shadow-md ${
                      totalScore >= LEVEL_THRESHOLDS.GURU 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className={`font-bold ${totalScore >= LEVEL_THRESHOLDS.GURU ? 'text-purple-900' : 'text-gray-400'}`}>Гуру</h3>
                    <p className={`text-xs mt-1 ${totalScore >= LEVEL_THRESHOLDS.GURU ? 'text-gray-500' : 'text-gray-400'}`}>
                      {totalScore >= LEVEL_THRESHOLDS.GURU ? 'Набрал 3200 баллов!' : 'Набери 3200 баллов'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Прогресс и мотивация */}
              <motion.div 
                className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-100 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 1.2 } }}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold text-purple-900">Твой прогресс в программировании</h3>
                    {gradesLoading ? (
                      <p className="text-purple-700 mt-1">Загрузка оценок...</p>
                    ) : grades.length > 0 ? (
                      <p className="text-purple-700 mt-1">
                        Ты уже набрал {totalScore} {totalScore === 1 ? 'балл' : 
                          totalScore >= 2 && totalScore <= 4 ? 'балла' : 
                          totalScore >= 5 && totalScore <= 20 ? 'баллов' : 
                          totalScore % 10 === 1 && totalScore % 100 !== 11 ? 'балл' : 
                          totalScore % 10 >= 2 && totalScore % 10 <= 4 && (totalScore % 100 < 12 || totalScore % 100 > 14) ? 'балла' : 'баллов'}! 
                        {totalScore < LEVEL_THRESHOLDS.GURU ? 
                          ` Осталось ещё ${LEVEL_THRESHOLDS.GURU - totalScore} до звания Гуру!` : 
                          ' Ты настоящий Гуру программирования!'}
                      </p>
                    ) : (
                      <p className="text-purple-700 mt-1">
                        У тебя пока нет оценок. Выполняй задания, чтобы получить первые баллы!
                      </p>
                    )}
                  </div>
                  
                  <motion.button
                    className="inline-flex items-center px-5 py-2.5 rounded-lg 
                              bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium 
                              shadow-lg shadow-purple-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => courses.length > 0 && handleCourseClick(courses[0].id)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Начать обучение</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default DashboardPage; 