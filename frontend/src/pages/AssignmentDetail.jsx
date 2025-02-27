import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    HiChevronLeft, 
    HiBookOpen, 
    HiCode, 
    HiPlay,
    HiArrowLeft,
    HiArrowRight 
} from 'react-icons/hi';
import { useAssignmentStore } from '../stores/assignmentStore';
import CodeEditor from '../_components/CodeEditor';

const AssignmentDetail = () => {
    const { courseId, lessonId, assignmentId } = useParams();
    const navigate = useNavigate();
    const { 
        currentAssignment, 
        isLoading, 
        error,
        fetchAssignment,
        fetchAssignments,
        getAdjacentAssignments 
    } = useAssignmentStore();

    useEffect(() => {
        const loadData = async () => {
            if (lessonId && assignmentId) {
                await fetchAssignments(lessonId); // Загружаем все задания
                await fetchAssignment(assignmentId);
            }
        };
        loadData();
    }, [lessonId, assignmentId, fetchAssignments, fetchAssignment]);

    // Получаем соседние задания
    const { prev, next } = currentAssignment ? getAdjacentAssignments(currentAssignment.id) : { prev: null, next: null };

    // Функция навигации
    const navigateToAssignment = (assignment) => {
        if (assignment) {
            navigate(`/courses/${courseId}/lessons/${lessonId}/assignments/${assignment.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-center py-4">
                Error: {error}
            </div>
        );
    }

    if (!currentAssignment) {
        return (
            <div className="text-center py-4">
                Assignment not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col space-y-4">
                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    to={`/courses/${courseId}/lessons/${lessonId}/assignments`}
                                    className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                >
                                    <HiChevronLeft className="h-5 w-5" />
                                    <span className="font-medium">Back to Assignments</span>
                                </Link>
                            </div>
                            
                            {/* Assignment Navigation */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigateToAssignment(prev)}
                                    disabled={!prev}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                        prev 
                                            ? 'text-gray-700 hover:bg-gray-100' 
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <HiArrowLeft className="h-5 w-5 mr-2" />
                                    <span className="font-medium">Previous</span>
                                </button>
                                
                                <button
                                    onClick={() => navigateToAssignment(next)}
                                    disabled={!next}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                        next 
                                            ? 'text-gray-700 hover:bg-gray-100' 
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <span className="font-medium">Next</span>
                                    <HiArrowRight className="h-5 w-5 ml-2" />
                                </button>
                            </div>
                        </div>

                        {/* Assignment Title с индикатором прогресса */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        {currentAssignment.title}
                                    </h1>
                                    {/* Добавляем индикатор прогресса */}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Assignment {prev ? prev.length + 1 : 1} of {prev ? prev.length + 2 : next ? 2 : 1}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 ring-1 ring-green-200">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Левая колонка с описанием (расширенная) */}
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
                                <div className="flex items-center text-white">
                                    <HiBookOpen className="h-6 w-6" />
                                    <h2 className="ml-2 text-xl font-semibold tracking-wide">Assignment Description</h2>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="prose prose-lg max-w-none">
                                    <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 shadow-inner">
                                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                            {currentAssignment.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка с редактором */}
                    <div className="col-span-12 lg:col-span-5">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-white">
                                        <HiCode className="h-6 w-6" />
                                        <h2 className="ml-2 text-xl font-semibold tracking-wide">Code Editor</h2>
                                    </div>
                                    <button 
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        onClick={() => {/* Handle run */}}
                                    >
                                        <HiPlay className="h-5 w-5 mr-2" />
                                        Run Code
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-900">
                                <CodeEditor
                                    initialCode={currentAssignment.code_editor || '# Your code here'}
                                    onRun={(code) => console.log('Running code:', code)}
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