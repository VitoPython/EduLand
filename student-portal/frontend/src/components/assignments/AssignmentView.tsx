import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
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
  attachments?: string[];
}

interface AssignmentSubmission {
  _id: string;
  student_id: string;
  lesson_id: string;
  assignment_id: string;
  is_submitted: boolean;
  submit_date?: string;
  created_at: string;
  updated_at: string;
}

interface SubmitStatus {
  is_submitted: boolean;
  submit_date?: string;
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

// Компонент для отображения прикрепленных материалов
const AttachmentsList = ({ attachments }: { attachments?: string[] }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-xl p-6 shadow-inner border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Прикрепленные материалы</h3>
      <div className="space-y-3">
        {attachments.map((attachment, index) => (
          <div key={index} className="flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <a 
              href={`${API_URL}/files/${attachment}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {attachment.split('/').pop() || attachment}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент для загрузки файлов
const FileUploader = ({ assignmentId, onFileUploaded }: { 
  assignmentId: string,
  onFileUploaded: (filePath: string) => void 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Пожалуйста, выберите файл для загрузки');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      // 1. Загружаем файл
      const uploadResponse = await axios.post(
        `${API_URL}/files/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('File uploaded:', uploadResponse.data);
      
      // 2. Получаем текущее задание
      const assignmentResponse = await axios.get(
        `${API_URL}/assignments/${assignmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // 3. Подготовка списка приложений
      const currentAttachments = assignmentResponse.data.attachments || [];
      const filePath = uploadResponse.data.path;
      
      // 4. Обновляем задание с новым приложением
      await axios.patch(
        `${API_URL}/assignments/${assignmentId}`,
        {
          attachments: [...currentAttachments, filePath]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // 5. Оповещаем родительский компонент
      onFileUploaded(filePath);
      
      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Произошла ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl p-6 shadow-inner border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Загрузить материалы к заданию</h3>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
              <span className="font-medium">Выбрать файл</span>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {selectedFile && (
            <span className="ml-3 text-gray-600">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} КБ)
            </span>
          )}
        </div>
        
        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-2 rounded-lg font-medium ${
              uploading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                <span>Загрузка...</span>
              </div>
            ) : (
              'Загрузить файл'
            )}
          </button>
        )}
        
        {uploadError && (
          <div className="text-red-500 text-sm mt-2">{uploadError}</div>
        )}
        
        {uploadSuccess && (
          <div className="text-green-500 text-sm mt-2">Файл успешно загружен!</div>
        )}
      </div>
    </div>
  );
};

// Мемоизированный компонент редактора кода
const CodeEditor = memo(({ 
  code, 
  onChange,
  onBlur,
  options = {}
}: { 
  code: string; 
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  options?: Record<string, any>;
}) => {
  // Создаем внутренний ref для хранения значения кода
  const valueRef = useRef(code);
  
  // Инициализируем состояние только при первой загрузке
  useEffect(() => {
    valueRef.current = code;
  }, []);
  
  // Мемоизируем функцию onChange, чтобы избежать ререндеринга при каждом изменении
  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      valueRef.current = value;
      onChange(value);
    }
  }, [onChange]);
  
  // Обработчик потери фокуса редактором
  const handleEditorDidBlur = useCallback(() => {
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  return (
    <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-inner">
      <Editor
        height="400px"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={handleChange}
        options={options}
        onMount={(editor) => {
          // Добавляем обработчик потери фокуса
          editor.onDidBlurEditorWidget(() => {
            handleEditorDidBlur();
          });
        }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Всегда возвращаем true для предотвращения ререндеров при изменении кода
  // Компонент будет перерисовываться только при изменении других пропсов
  return true;
});

const AssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  // Меняем стратегию работы с кодом
  const [code, setCodeState] = useState('');
  const codeRef = useRef(code);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevAssignmentId, setPrevAssignmentId] = useState<string | null>(null);
  const [nextAssignmentId, setNextAssignmentId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [refreshAttachments, setRefreshAttachments] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Добавляем ref для хранения таймера дебаунса
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Функция принудительного обновления state, когда это действительно нужно
  const syncCodeState = useCallback(() => {
    setCodeState(codeRef.current);
  }, []);

  // Функция для автосохранения кода
  const autoSaveCode = useCallback(async () => {
    const currentCode = codeRef.current;
    const studentId = localStorage.getItem('studentId');
    const studentToken = localStorage.getItem('studentToken');
    
    if (!studentId || !studentToken || !assignmentId || !currentCode) {
      return;
    }
    
    try {
      setAutoSaveStatus('saving');
      await axios.patch(
        `${API_URL}/student-code/student/${studentId}/assignment/${assignmentId}`,
        { code: currentCode },
        {
          headers: {
            'Authorization': `Bearer ${studentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setAutoSaveStatus('saved');
      
      // Синхронизируем состояние после успешного сохранения
      syncCodeState();
      
      // Сбросить статус сохранения через 2 секунды
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Ошибка автосохранения:', error);
      setAutoSaveStatus('error');
      
      // Сбросить статус ошибки через 3 секунды
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
    }
  }, [assignmentId, syncCodeState]);

  // Создаем функцию дебаунса для автосохранения
  const debouncedAutoSave = useCallback((delay: number = 1000) => {
    // Отменяем предыдущий таймер, если он есть
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Устанавливаем новый таймер
    debounceTimerRef.current = setTimeout(() => {
      autoSaveCode();
      debounceTimerRef.current = null;
    }, delay);
  }, [autoSaveCode]);
  
  // Модифицируем функцию setCode для использования дебаунса
  const setCode = useCallback((value: string) => {
    // Обновляем ref при вводе
    codeRef.current = value;
    // Запускаем дебаунс для автосохранения
    debouncedAutoSave(1500); // 1.5 секунды дебаунса
  }, [debouncedAutoSave]);

  // Мемоизируем обработчик потери фокуса редактором
  const handleCodeEditorBlur = useCallback(() => {
    // При потере фокуса автоматически сохраняем код
    // Отменяем дебаунс если он есть
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // Мгновенно сохраняем код
    autoSaveCode();
  }, [autoSaveCode]);

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Мемоизируем функцию получения статуса отправки
  const fetchSubmitStatus = useCallback(async (studentId: string, assignmentId: string, token: string) => {
    try {
      // Использование нового API для получения статуса сабмита
      const submitResponse = await axios.get(
        `${API_URL}/assignment-submission/student/${studentId}/assignment/${assignmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const currentDate = new Date().toISOString();
      
      // API всегда возвращает объект, даже для несуществующих записей
      setSubmitStatus({
        is_submitted: submitResponse.data.is_submitted,
        submit_date: submitResponse.data.submit_date || currentDate
      });
      
      // Если ID начинается с dummy_, значит это заглушка и нет реальной записи
      if (!submitResponse.data._id.startsWith('dummy_')) {
        // Сохраняем ID сабмита для последующего обновления только если это настоящая запись
        setSubmissionId(submitResponse.data._id);
        
        // Если submit_date отсутствует в ответе, но is_submitted=true, 
        // отправляем запрос на обновление даты
        if (submitResponse.data.is_submitted && !submitResponse.data.submit_date) {
          await axios.patch(
            `${API_URL}/assignment-submission/${submitResponse.data._id}`,
            { 
              is_submitted: true,
              submit_date: currentDate
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      } else {
        // Для заглушек нет реального ID
        setSubmissionId(null);
      }
      
    } catch (submitErr: any) {
      console.error('Ошибка при получении статуса задания:', submitErr);
      // В случае ошибок устанавливаем is_submitted в false,
      // чтобы пользователь мог отправить задание
      setSubmitStatus({ is_submitted: false });
      setSubmissionId(null);
    }
  }, []);

  // Мемоизируем функцию получения заданий урока
  const fetchLessonAssignments = useCallback(async (lessonId: string, token: string) => {
    const lessonsResponse = await axios.get(`${API_URL}/lessons/${lessonId}/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

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
  }, [assignmentId]);

  // Мемоизируем функцию получения задания
  const fetchAssignment = useCallback(async () => {
    try {
      if (!assignmentId) {
        setError('ID задания не указан');
        setLoading(false);
        return;
      }

      // Проверяем наличие токена и ID студента
      const studentToken = localStorage.getItem('studentToken');
      const studentId = localStorage.getItem('studentId');

      if (!studentToken || !studentId) {
        setError('Необходима авторизация');
        navigate('/login');
        return;
      }

      // Получаем задание
      const response = await axios.get(`${API_URL}/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${studentToken}`
        }
      });

      setAssignment(response.data);
      
      // Пытаемся получить сохраненный код студента или используем код из задания
      try {
        const codeResponse = await axios.get(
          `${API_URL}/student-code/student/${studentId}/assignment/${assignmentId}`,
          {
            headers: {
              'Authorization': `Bearer ${studentToken}`
            }
          }
        );
        // Если есть сохраненный код, используем его
        if (codeResponse.data && codeResponse.data.code) {
          // Обновляем и ref и state одновременно
          codeRef.current = codeResponse.data.code;
          setCodeState(codeResponse.data.code);
        } else {
          // Иначе используем код из задания
          const templateCode = response.data.code_editor || '';
          codeRef.current = templateCode;
          setCodeState(templateCode);
        }
      } catch (codeErr) {
        // Если кода нет, используем шаблон из задания
        const templateCode = response.data.code_editor || '';
        codeRef.current = templateCode;
        setCodeState(templateCode);
      }

      // Получаем статус отправки и задания урока параллельно
      await Promise.all([
        fetchSubmitStatus(studentId, assignmentId, studentToken),
        fetchLessonAssignments(response.data.lesson_id, studentToken)
      ]);

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
  }, [assignmentId, navigate, fetchSubmitStatus, fetchLessonAssignments]);

  // Используем useEffect только для начальной загрузки
  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  // Мемоизируем функцию навигации
  const navigateToAssignment = useCallback((id: string | null, newDirection: 'left' | 'right') => {
    if (id) {
      setDirection(newDirection);
      navigate(`/assignments/${id}`);
    }
  }, [navigate]);

  // Модифицируем handleSubmit, чтобы синхронизировать state перед отправкой
  const handleSubmit = useCallback(async () => {
    try {
      // Сначала синхронизируем state с ref для сохранения консистентности
      syncCodeState();
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      const studentId = localStorage.getItem('studentId');
      const studentToken = localStorage.getItem('studentToken');
      
      if (!studentId || !studentToken) {
        throw new Error('Необходима авторизация');
      }

      if (!assignmentId || !assignment) {
        throw new Error('Отсутствуют данные задания');
      }

      // Используем текущее значение кода из ref
      const currentCode = codeRef.current;

      // 1. Сначала сохраняем код студента
      try {
        await axios.patch(
          `${API_URL}/student-code/student/${studentId}/assignment/${assignmentId}`,
          { 
            code: currentCode 
          },
          {
            headers: {
              'Authorization': `Bearer ${studentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Код успешно сохранен');
      } catch (codeErr: any) {
        // Если получаем 404 (код еще не существует), создаем новую запись
        if (codeErr.response?.status === 404) {
          try {
            await axios.post(
              `${API_URL}/student-code/`,
              {
                student_id: studentId,
                assignment_id: assignmentId,
                code: currentCode
              },
              {
                headers: {
                  'Authorization': `Bearer ${studentToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log('Создана новая запись кода');
          } catch (createErr) {
            console.error('Ошибка при создании записи кода:', createErr);
            // Продолжаем выполнение, даже если не удалось сохранить код
          }
        } else {
          console.error('Ошибка при сохранении кода:', codeErr);
          // Продолжаем выполнение, даже если не удалось сохранить код
        }
      }

      // 2. Затем обновляем статус отправки задания
      if (submissionId) {
        try {
          const response = await axios.patch(
            `${API_URL}/assignment-submission/${submissionId}`,
            { 
              is_submitted: true 
            },
            {
              headers: {
                'Authorization': `Bearer ${studentToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200) {
            setSubmitStatus({
              is_submitted: true,
              submit_date: response.data.submit_date || new Date().toISOString()
            });
            
            // Принудительно обновляем данные статуса отправки
            await fetchSubmitStatus(studentId, assignmentId, studentToken);
          }
        } catch (err: any) {
          console.error('Ошибка при обновлении статуса:', err);
          // Если не удалось обновить, пробуем создать новую запись
          if (err.response?.status === 404) {
            const submitData = {
              student_id: studentId,
              lesson_id: assignment.lesson_id,
              assignment_id: assignmentId,
              is_submitted: true,
              submit_date: new Date().toISOString()
            };
    
            const createResponse = await axios.post(
              `${API_URL}/assignment-submission/`,
              submitData,
              {
                headers: {
                  'Authorization': `Bearer ${studentToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
    
            if (createResponse.status === 201) {
              setSubmitStatus({
                is_submitted: true,
                submit_date: createResponse.data.submit_date || new Date().toISOString()
              });
              setSubmissionId(createResponse.data._id);
            }
          } else {
            throw err; // Пробрасываем ошибку дальше, если это не 404
          }
        }
      } else {
        // Если ID сабмита нет, то создаем новый
        const submitData = {
          student_id: studentId,
          lesson_id: assignment.lesson_id,
          assignment_id: assignmentId,
          is_submitted: true,
          submit_date: new Date().toISOString() // Принудительно указываем дату отправки
        };

        const response = await axios.post(
          `${API_URL}/assignment-submission/`,
          submitData,
          {
            headers: {
              'Authorization': `Bearer ${studentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 201) {
          setSubmitStatus({
            is_submitted: true,
            submit_date: response.data.submit_date || new Date().toISOString()
          });
          setSubmissionId(response.data._id);
          
          // Принудительно обновляем данные статуса отправки
          await fetchSubmitStatus(studentId, assignmentId, studentToken);
        }
      }

    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setSubmitError(
        err.response?.data?.detail || 
        err.message || 
        'Произошла ошибка при отправке задания'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [assignmentId, assignment, submissionId, fetchSubmitStatus, setCode]);

  // Обработчик успешной загрузки файла
  const handleFileUploaded = useCallback((filePath: string) => {
    // Обновляем счетчик для принудительного обновления списка приложений
    setRefreshAttachments(prev => prev + 1);
    
    // Обновляем локальное состояние задания
    if (assignment) {
      setAssignment({
        ...assignment,
        attachments: [...(assignment.attachments || []), filePath]
      });
    }
  }, [assignment]);

  // Мемоизируем стили для редактора
  const editorOptions = useMemo(() => ({
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    folding: true,
    lineNumbers: "on" as const,
    renderLineHighlight: "all" as const,
    automaticLayout: true,
    tabSize: 4,
    wordWrap: "on" as const,
    padding: { top: 16, bottom: 16 }
  }), []);

  // Настройка интервала автосохранения (каждые 30 секунд)
  useEffect(() => {
    const interval = setInterval(() => {
      if (codeRef.current) {
        autoSaveCode();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoSaveCode]);

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

        {/* Информация о статусе отправки */}
        {submitStatus?.is_submitted ? (
          <div className="mb-4 flex items-center px-4 py-2 bg-green-50 border border-green-100 rounded-lg text-green-700">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              Задание отправлено
              {submitStatus.submit_date ? 
                `: ${new Date(submitStatus.submit_date).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}` : 
                ' только что'
              }
            </span>
          </div>
        ) : (
          <div className="mb-4 flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Задание еще не отправлялось</span>
          </div>
        )}
        
        {submitError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-red-600 font-medium">Произошла ошибка при отправке задания</p>
              <p className="text-red-500 text-sm mt-1">{submitError}</p>
              <button 
                onClick={handleSubmit} 
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
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
                {/* Кнопка отправки задания */}
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium shadow-md transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                      : submitStatus?.is_submitted 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:from-emerald-600 hover:to-teal-600' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full animate-spin" />
                      <span>Отправка...</span>
                    </>
                  ) : submitStatus?.is_submitted ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Отправлено</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>Отправить</span>
                    </>
                  )}
                </motion.button>
                
                {/* Навигационные кнопки */}
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
                  <CodeEditor 
                    code={code}
                    onChange={(value) => value && setCode(value)}
                    onBlur={handleCodeEditorBlur}
                    options={editorOptions}
                  />
                  {autoSaveStatus !== 'idle' && (
                    <div className="mt-2 flex items-center text-sm">
                      {autoSaveStatus === 'saving' && (
                        <div className="text-amber-500 flex items-center gap-1">
                          <div className="w-3 h-3 border-t-2 border-r-2 border-amber-500 rounded-full animate-spin" />
                          <span>Сохранение...</span>
                        </div>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <div className="text-emerald-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Сохранено</span>
                        </div>
                      )}
                      {autoSaveStatus === 'error' && (
                        <div className="text-red-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Ошибка сохранения</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Прикрепленные материалы */}
              <AttachmentsList attachments={assignment.attachments} />

              {/* Компонент для загрузки файлов */}
              <FileUploader 
                assignmentId={assignmentId || ''} 
                onFileUploaded={handleFileUploaded} 
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AssignmentView; 