import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';

interface Assignment {
  _id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

const getStatusBadgeClass = (status: Assignment['status']) => {
  switch (status) {
    case 'not_started':
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200';
    case 'in_progress':
      return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200';
    case 'completed':
      return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200';
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200';
  }
};

const getStatusIcon = (status: Assignment['status']) => {
  switch (status) {
    case 'not_started':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'in_progress':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'completed':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    default:
      return null;
  }
};

const getStatusText = (status: Assignment['status']) => {
  switch (status) {
    case 'not_started':
      return 'Не начато';
    case 'in_progress':
      return 'В процессе';
    case 'completed':
      return 'Завершено';
    default:
      return 'Не определено';
  }
};

const LessonAssignments = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(`http://localhost:8001/lessons/${lessonId}/assignments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
          }
        });
        
        const processedAssignments = response.data.map((assignment: any) => ({
          ...assignment,
          status: assignment.status || 'not_started'
        }));

        setAssignments(processedAssignments);
      } catch (err) {
        setError('Не удалось загрузить список заданий');
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [lessonId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800">Произошла ошибка</h3>
                <p className="mt-1 text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate(-1)}
              className="bg-white p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-100"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Задания урока
              </h1>
              <p className="text-gray-500 mt-1">Всего заданий: {assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid gap-4 p-6">
            {assignments.map((assignment) => (
              <div
                key={`assignment-${assignment._id}`}
                onClick={() => navigate(`/assignments/${assignment._id}`)}
                className="group relative bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center mt-2">
                        {assignment.status !== 'not_started' && (
                          <span className={`px-3 py-1 inline-flex items-center space-x-1 text-xs font-medium rounded-full ${getStatusBadgeClass(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            <span>{getStatusText(assignment.status)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/assignments/${assignment._id}`);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                  >
                    <span>Открыть</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-16">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-full inline-block mb-6 border border-gray-200">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">В этом уроке пока нет заданий</h3>
            <p className="text-gray-500">Задания появятся здесь, когда они будут добавлены</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LessonAssignments; 