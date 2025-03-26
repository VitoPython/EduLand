import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Course } from '../types';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import CourseInfo from '../components/course/CourseInfo';
import LessonsList from '../components/course/LessonsList';

const API_URL = 'http://localhost:8001';

const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('studentToken');
        if (!token) {
          setError('Необходима авторизация');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const courseResponse = await axios.get(`${API_URL}/courses/${courseId}`, { headers });
        console.log('Raw course data:', courseResponse.data);
        console.log('Number of lessons:', courseResponse.data.lessons?.length || 0);
        console.log('Lessons:', courseResponse.data.lessons);
        
        // Проверяем и трансформируем данные если нужно
        const processedCourse = {
          ...courseResponse.data,
          _id: courseResponse.data._id?.$oid || courseResponse.data._id || courseResponse.data.id,
          lessons: (courseResponse.data.lessons || []).map((lesson: any) => ({
            ...lesson,
            _id: lesson._id?.$oid || lesson._id || lesson.id,
            course_id: lesson.course_id?.$oid || lesson.course_id,
            assignments: lesson.assignments || []
          }))
        };
        
        console.log('Processed course data:', processedCourse);
        console.log('Processed lessons:', processedCourse.lessons);
        
        setCourse(processedCourse);
      } catch (err) {
        setError('Ошибка при загрузке данных курса');
        console.error('Error details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

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

  if (!course) {
    return (
      <Layout>
        <div className="text-center p-4">Курс не найден</div>
      </Layout>
    );
  }

  console.log('Rendering course with lessons:', course.lessons);

  return (
    <Layout>
      <div className="space-y-6">
        <CourseInfo 
          title={course.title}
          description={course.description}
          duration={course.duration}
          price={course.price}
          created_at={course.created_at}
        />
        
        <LessonsList lessons={course.lessons || []} />
      </div>
    </Layout>
  );
};

export default CoursePage; 