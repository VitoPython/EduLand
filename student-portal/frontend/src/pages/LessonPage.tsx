import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lesson, Assignment } from '../types';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { DocumentTextIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:8001';

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonAndAssignments = async () => {
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

        const [lessonResponse, assignmentsResponse] = await Promise.all([
          axios.get(`${API_URL}/lessons/${lessonId}`, { headers }),
          axios.get(`${API_URL}/lessons/${lessonId}/assignments`, { headers })
        ]);
        setLesson(lessonResponse.data);
        setAssignments(assignmentsResponse.data);
      } catch (err) {
        setError('Ошибка при загрузке данных урока');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonAndAssignments();
    }
  }, [lessonId]);

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

  if (!lesson) {
    return (
      <Layout>
        <div className="text-center p-4">Урок не найден</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Навигация обратно к курсу */}
        <div>
          <Link 
            to={`/courses/${lesson.course_id}`} 
            className="text-primary-600 hover:text-primary-800 flex items-center"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к курсу
          </Link>
        </div>

        {/* Заголовок урока */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
          <p className="mt-2 text-gray-600">{lesson.description}</p>
        </div>

        {/* Содержание урока */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Содержание урока</h2>
          </div>
          
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content || '<p>Содержание урока не доступно.</p>' }} />
        </div>

        {/* Задания урока */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <ClipboardDocumentListIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Задания</h2>
          </div>
          
          {assignments.length === 0 ? (
            <p>В этом уроке пока нет заданий</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg">{assignment.title}</h3>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <Link 
                    to={`/assignments/${assignment.id}`}
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white py-1.5 px-3 text-sm rounded"
                  >
                    Просмотреть задание
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LessonPage; 