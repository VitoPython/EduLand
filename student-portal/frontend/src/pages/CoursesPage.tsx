import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  created_at: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8001/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
          }
        });
        console.log('Полученные курсы:', response.data);
        setCourses(response.data);
      } catch (err) {
        setError('Не удалось загрузить список курсов');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (courseId: string) => {
    console.log('Переход к курсу:', courseId);
    navigate(`/courses/${courseId}/lessons`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">Загрузка...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500 text-center p-4">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Мои курсы</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              onClick={() => handleCourseClick(course._id)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
            >
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{course.duration} часов</span>
                <span>${course.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CoursesPage; 