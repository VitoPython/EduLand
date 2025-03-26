import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from "@monaco-editor/react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_URL = 'http://localhost:8001';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  code_editor: string;
  lesson_id: string;
}

const pageTransition = {
  initial: (direction: 'left' | 'right') => ({
    opacity: 0,
    x: direction === 'right' ? 20 : -20
  }),
  animate: {
    opacity: 1,
    x: 0
  },
  exit: (direction: 'left' | 'right') => ({
    opacity: 0,
    x: direction === 'right' ? -20 : 20
  }),
  transition: { duration: 0.3, ease: 'easeInOut' }
};

const buttonHoverEffect = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

const buttonTapEffect = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

const AssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  console.log('Current assignment ID:', assignmentId);

  const [code, setCode] = useState('');
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevAssignmentId, setPrevAssignmentId] = useState<string | null>(null);
  const [nextAssignmentId, setNextAssignmentId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        if (!assignmentId) {
          setError('ID задания не указан');
          setLoading(false);
          return;
        }

        console.log('Fetching assignment with ID:', assignmentId);

        // Получаем задание
        const response = await axios.get(`${API_URL}/assignments/${assignmentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
          }
        });

        console.log('Assignment data:', response.data);

        setAssignment(response.data);
        setCode(response.data.code_editor || '');

        // Получаем все задания для урока
        const lessonsResponse = await axios.get(`${API_URL}/lessons/${response.data.lesson_id}/assignments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
          }
        });

        console.log('Lessons response:', lessonsResponse.data);

        const assignments = lessonsResponse.data;
        const currentIndex = assignments.findIndex((a: Assignment) => a._id === assignmentId);
        
        if (currentIndex > 0) {
          setPrevAssignmentId(assignments[currentIndex - 1]._id);
        } else {
          setPrevAssignmentId(null);
        }
        
        if (currentIndex < assignments.length - 1) {
          setNextAssignmentId(assignments[currentIndex + 1]._id);
        } else {
          setNextAssignmentId(null);
        }
      } catch (err: any) {
        console.error('Error fetching assignment:', err.response || err);
        if (err.response?.status === 404) {
          setError('Задание не найдено');
        } else if (err.response?.status === 401) {
          setError('Необходима авторизация');
          navigate('/login');
        } else {
          setError(`Не удалось загрузить задание: ${err.response?.data?.detail || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, navigate]);

  const navigateToAssignment = (id: string | null, newDirection: 'left' | 'right') => {
    if (id) {
      setDirection(newDirection);
      navigate(`/assignments/${id}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="group mb-6 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </div>
            <span className="font-medium">Назад к урокам</span>
          </button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="group mb-6 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </div>
            <span className="font-medium">Назад к урокам</span>
          </button>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!assignment) {
    return null;
  }

  const descriptionLines = assignment.description.split('\n').filter(line => line.trim());

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="group mb-6 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
          </div>
          <span className="font-medium">Назад к урокам</span>
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div 
            key={assignmentId}
            className="space-y-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            custom={direction}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-6">
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  onClick={() => navigate(`/lessons/${assignment.lesson_id}/assignments`)}
                  className="bg-white p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-100"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {assignment.title}
                  </h1>
                </motion.div>
              </div>
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  onClick={() => navigateToAssignment(prevAssignmentId, 'left')}
                  disabled={!prevAssignmentId}
                  className={`p-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border ${
                    prevAssignmentId 
                      ? 'bg-white hover:bg-gray-50 border-gray-100 cursor-pointer' 
                      : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <svg className={`w-6 h-6 ${prevAssignmentId ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  onClick={() => navigateToAssignment(nextAssignmentId, 'right')}
                  disabled={!nextAssignmentId}
                  className={`p-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border ${
                    nextAssignmentId 
                      ? 'bg-white hover:bg-gray-50 border-gray-100 cursor-pointer' 
                      : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <svg className={`w-6 h-6 ${nextAssignmentId ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>

            <motion.div 
              className="grid gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Описание задания */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-2xl shadow-lg border border-blue-100/50 overflow-hidden backdrop-blur-sm relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-40" />
                      <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                        Описание задания
                      </h2>
                      <p className="text-blue-600/60 text-sm mt-1 font-medium">
                        Внимательно прочитайте условие перед выполнением
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-inner border border-gray-100">
                      <style>
                        {`
                          .ql-editor {
                            padding: 0;
                            font-family: 'Inter', -apple-system, sans-serif;
                            font-size: 15px;
                            line-height: 1.6;
                          }
                          .ql-editor p {
                            margin: 1em 0;
                            line-height: 1.75;
                            color: #374151;
                          }
                          .ql-editor pre.ql-syntax {
                            background-color: #18181B;
                            color: #e5e7eb;
                            border-radius: 8px;
                            padding: 1.25rem;
                            font-family: 'JetBrains Mono', 'Fira Code', monospace;
                            margin: 1.5em 0;
                            font-size: 0.95em;
                            line-height: 1.5;
                            overflow-x: auto;
                            border: 1px solid rgba(63, 63, 70, 0.4);
                          }
                          .ql-editor img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 8px;
                            margin: 1.5em 0;
                            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                            border: 1px solid rgba(229, 231, 235, 0.5);
                          }
                          .ql-editor strong {
                            font-weight: 600;
                            color: #111827;
                          }
                          .ql-editor em {
                            color: #4B5563;
                            font-style: italic;
                          }
                          .ql-editor ul, .ql-editor ol {
                            padding-left: 1.5em;
                            margin: 1.5em 0;
                            color: #374151;
                          }
                          .ql-editor li {
                            margin: 0.5em 0;
                            padding-left: 0.5em;
                          }
                          .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                            font-weight: 700;
                            line-height: 1.25;
                            margin: 1.5em 0 1em;
                            background: linear-gradient(to right, #111827, #374151);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                          }
                          .ql-editor h1 {
                            font-size: 2em;
                            border-bottom: 2px solid #e5e7eb;
                            padding-bottom: 0.5em;
                          }
                          .ql-editor h2 {
                            font-size: 1.5em;
                            margin-top: 2em;
                          }
                          .ql-editor h3 {
                            font-size: 1.25em;
                            color: #374151;
                          }
                          .ql-editor blockquote {
                            border-left: 4px solid #e5e7eb;
                            padding: 1em 1.5em;
                            color: #6b7280;
                            font-style: italic;
                            margin: 1.5em 0;
                            background: linear-gradient(to right, rgba(249, 250, 251, 0.8), rgba(249, 250, 251, 0.4));
                            border-radius: 0 8px 8px 0;
                          }
                        `}
                      </style>
                      <div 
                        className="ql-editor"
                        dangerouslySetInnerHTML={{ __html: assignment.description }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Редактор кода */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50">
                <div className="border-b border-slate-700/50">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur-md opacity-20" />
                        <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                          Редактор кода
                        </h2>
                        <p className="text-slate-400 text-sm">Python</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-inner">
                    <Editor
                      height="400px"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        folding: true,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: "on",
                        padding: { top: 16, bottom: 16 }
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AssignmentView; 