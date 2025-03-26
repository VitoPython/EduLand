import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8001';

interface Assignment {
  _id: string;
  title: string;
  lesson_id: string;
  course_id: string;
}

interface Lesson {
  _id: string;
  title: string;
  course_id: string;
}

const LessonContent = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lessonId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonResponse, assignmentsResponse] = await Promise.all([
          axios.get(`${API_URL}/lessons/${lessonId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
            }
          }),
          axios.get(`${API_URL}/lessons/${lessonId}/assignments`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
            }
          })
        ]);
        
        setLesson(lessonResponse.data);
        setAssignments(assignmentsResponse.data);
      } catch (err) {
        setError('Не удалось загрузить данные');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
  }

  if (error || !lesson) {
    return <div className="text-red-500 text-center p-4">{error || 'Урок не найден'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to={`/courses/${lesson.course_id}`} className="text-blue-600 hover:text-blue-800">
          ← Назад к курсу
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">{lesson.title}</h1>

      {/* Содержание урока */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold">Содержание урока</h2>
        </div>
        <p className="text-gray-600">Содержание урока не доступно.</p>
      </div>

      {/* Задания */}
      <div>
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-semibold">Задания</h2>
        </div>

        {assignments.map((assignment, index) => (
          <div key={assignment._id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="text-lg font-medium mb-2">{assignment.title}</h3>
            <p className="text-gray-600 mb-4">
              {index === 0 ? 
                'To start working with the turtle, you first need to enter the following code: import turtle t = turtle.Turtle() t.shape("turtle") Run the code to see the turtle...' :
                'The ready-made code allows you to draw one 50-pixel side of a square and turn left by 90 degrees...'
              }
            </p>
            <Link
              to={`/assignments/${assignment._id}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Просмотреть задание
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonContent; 