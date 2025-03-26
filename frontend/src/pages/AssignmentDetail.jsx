import { useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    HiChevronLeft, 
    HiBookOpen, 
    HiCode, 
    HiArrowLeft,
    HiArrowRight 
} from 'react-icons/hi';
import { useAssignmentStore } from '../stores/assignmentStore';
import CodeEditor from '../_components/CodeEditor';
import ReactQuill from 'react-quill';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';
import 'react-quill/dist/quill.snow.css';

// Конфигурация highlight.js
hljs.configure({
    languages: ['javascript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php']
});

const AssignmentDetail = () => {
    const { courseId, lessonId, assignmentId } = useParams();
    const navigate = useNavigate();
    const quillRef = useRef(null);
    
    const { 
        currentAssignment, 
        isLoading, 
        error,
        fetchAssignment,
        fetchAssignments,
        getAdjacentAssignments,
        updateAssignment
    } = useAssignmentStore();

    // Добавляем логирование для отладки
    useEffect(() => {
        console.log('Current Assignment:', currentAssignment);
    }, [currentAssignment]);

    const modules = useMemo(() => ({
        syntax: {
            highlight: text => hljs.highlightAuto(text).value
        },
        toolbar: false,
        clipboard: {
            matchVisual: false
        }
    }), []);

    useEffect(() => {
        const loadData = async () => {
            if (lessonId && assignmentId) {
                console.log('Loading data for:', { lessonId, assignmentId });
                try {
                    await fetchAssignments(lessonId);
                    await fetchAssignment(assignmentId);
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }
        };
        loadData();
    }, [lessonId, assignmentId, fetchAssignments, fetchAssignment]);

    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.root.setAttribute('spellcheck', 'false');
            
            // Отключаем автоматическое изменение размера
            editor.root.style.height = '100%';
            editor.root.style.minHeight = 'auto';
            editor.root.style.maxHeight = 'none';
            editor.root.style.overflow = 'visible';
            
            // Устанавливаем размер контейнера
            const container = editor.container;
            container.style.height = 'auto';
            container.style.minHeight = '200px';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
        }
    }, [currentAssignment]);

    // Эффект для подсветки синтаксиса
    useEffect(() => {
        const highlights = document.querySelectorAll('pre.ql-syntax');
        highlights.forEach((block) => {
            hljs.highlightElement(block);
        });
    }, [currentAssignment?.description]);

    const { prev, next } = currentAssignment ? getAdjacentAssignments(currentAssignment.id || currentAssignment._id) : { prev: null, next: null };
    console.log('Navigation state:', {
        currentAssignment: currentAssignment?._id,
        prev: prev?._id,
        next: next?._id
    });

    const totalAssignments = useAssignmentStore(state => state.assignments.length);
    console.log('Total assignments:', totalAssignments);

    const currentIndex = useAssignmentStore(state => {
        if (!currentAssignment) return -1;
        return state.assignments.findIndex(assignment => 
            (assignment.id || assignment._id) === (currentAssignment.id || currentAssignment._id)
        );
    });

    const navigateToAssignment = (assignment) => {
        if (assignment) {
            const nextId = assignment.id || assignment._id;
            if (nextId) {
                console.log('Navigating to:', nextId);
                navigate(`/courses/${courseId}/lessons/${lessonId}/assignments/${nextId}`);
            }
        }
    };

    useEffect(() => {
        // Проверяем валидность ID при загрузке
        if (assignmentId === 'undefined' || !assignmentId) {
            console.log('Invalid assignment ID, redirecting to assignments list');
            navigate(`/courses/${courseId}/lessons/${lessonId}/assignments`);
            return;
        }
    }, [assignmentId, courseId, lessonId, navigate]);

    const handleCodeChange = (newCode) => {
        if (currentAssignment) {
            console.log('Updating code:', newCode);
            updateAssignment({
                ...currentAssignment,
                code_editor: newCode
            }).catch(error => {
                console.error('Error updating code:', error);
            });
        }
    };

    // Добавляем эффект для логирования значения code_editor
    useEffect(() => {
        if (currentAssignment) {
            console.log('Current code_editor value:', currentAssignment.code_editor);
        }
    }, [currentAssignment]);

    // Добавляем эффект для обновления данных при изменении URL
    useEffect(() => {
        if (currentAssignment) {
            console.log('Current assignment updated:', {
                id: currentAssignment._id,
                title: currentAssignment.title
            });
        }
    }, [currentAssignment]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        console.error('Error loading assignment:', error);
        return (
            <div className="text-red-600 text-center py-4">
                Error: {error}
            </div>
        );
    }

    if (!currentAssignment) {
        console.warn('No current assignment found');
        return (
            <div className="text-center py-4">
                Assignment not found
            </div>
        );
    }

    console.log('Rendering assignment:', {
        title: currentAssignment.title,
        description: currentAssignment.description,
        code_editor: currentAssignment.code_editor,
        _id: currentAssignment._id
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6">
            {/* Верхняя навигация */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/50 p-4">
                    <div className="flex items-center justify-between">
                        <Link
                            to={`/courses/${courseId}/lessons/${lessonId}/assignments`}
                            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                        >
                            <HiChevronLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Assignments</span>
                        </Link>
                        
                        {/* Навигация между заданиями */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => prev && navigateToAssignment(prev)}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                                    prev
                                        ? 'hover:bg-indigo-50 text-gray-700 hover:text-indigo-600'
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                                disabled={!prev}
                            >
                                <HiArrowLeft className={`h-5 w-5 transition-transform group-hover:-translate-x-1 ${
                                    prev ? 'text-indigo-600' : 'text-gray-300'
                                }`} />
                                <span className="hidden sm:inline font-medium">Prev</span>
                            </button>

                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white shadow-sm">
                                <span className="text-sm font-medium">Assignment</span>
                                <div className="flex items-center justify-center min-w-[3rem] px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <span className="text-sm font-bold">
                                        {currentIndex !== -1 ? `${currentIndex + 1}/${totalAssignments}` : '-/-'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => next && navigateToAssignment(next)}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                                    next
                                        ? 'hover:bg-indigo-50 text-gray-700 hover:text-indigo-600'
                                        : 'text-gray-300 cursor-not-allowed'
                                }`}
                                disabled={!next}
                            >
                                <span className="hidden sm:inline font-medium">Next</span>
                                <HiArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                                    next ? 'text-indigo-600' : 'text-gray-300'
                                }`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Левая колонка с описанием */}
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                                <div className="flex items-center text-white">
                                    <HiBookOpen className="h-6 w-6" />
                                    <h2 className="ml-2 text-xl font-semibold tracking-wide">
                                        {currentAssignment.title || 'Assignment Description'}
                                    </h2>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="prose prose-lg max-w-none">
                                    <div className="quill-container-readonly bg-white/50 rounded-xl">
                                        <ReactQuill
                                            ref={quillRef}
                                            value={currentAssignment.description || ''}
                                            readOnly={true}
                                            modules={modules}
                                            theme="snow"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка с редактором кода */}
                    <div className="col-span-12 lg:col-span-5">
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                                <div className="flex items-center text-white">
                                    <HiCode className="h-6 w-6" />
                                    <h2 className="ml-2 text-xl font-semibold tracking-wide">Code Editor</h2>
                                </div>
                            </div>
                            <div className="border-t border-gray-100/20">
                                <CodeEditor
                                    key={currentAssignment._id}
                                    value={currentAssignment.code_editor || '# Write your code here...'}
                                    onChange={handleCodeChange}
                                    language="python"
                                    height="500px"
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        readOnly: false,
                                        automaticLayout: true
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail; 