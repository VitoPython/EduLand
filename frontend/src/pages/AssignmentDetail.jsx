import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignmentStore } from '../stores/assignmentStore';
import CodeEditor from '../_components/CodeEditor';

const AssignmentDetail = () => {
    const { courseId, lessonId, assignmentId } = useParams();
    const navigate = useNavigate();
    const {
        currentAssignment,
        isLoading,
        error,
        fetchAssignment
    } = useAssignmentStore();

    useEffect(() => {
        if (!assignmentId) {
            navigate(`/courses/${courseId}/lessons/${lessonId}/assignments`);
            return;
        }
        fetchAssignment(assignmentId);
    }, [assignmentId, courseId, lessonId, navigate, fetchAssignment]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Навигация */}
            <div className="mb-8 flex items-center justify-between">
                <button
                    onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}/assignments`)}
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors group"
                >
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Assignments
                </button>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                        Last updated: {new Date(currentAssignment?.updated_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                {/* Левая панель с заданием */}
                <div className="flex flex-col h-full">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-grow">
                        {/* Заголовок задания */}
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-800">
                            <h1 className="text-2xl font-bold text-white">
                                {currentAssignment?.title}
                            </h1>
                        </div>

                        {/* Контент задания */}
                        <div className="p-8 space-y-8 overflow-auto max-h-[calc(100vh-300px)]">
                            <div className="prose prose-indigo max-w-none">
                                <div className="space-y-6">
                                    {/* Task Description */}
                                    <div className="bg-indigo-50/50 rounded-lg p-8">
                                        <div className="text-base text-indigo-600 font-medium mb-4">
                                            Task Description
                                        </div>
                                        <div 
                                            className="prose-base prose-p:my-3 prose-headings:mt-6 prose-headings:mb-4"
                                            dangerouslySetInnerHTML={{ __html: currentAssignment?.description || '' }}
                                        />
                                    </div>

                                    {/* Initial Code */}
                                    <div className="bg-gray-50 rounded-lg p-8">
                                        <div className="text-base text-gray-600 font-medium mb-4">
                                            Initial Code
                                        </div>
                                        <div className="bg-gray-900 rounded-lg">
                                            <pre className="text-base font-mono text-gray-300 p-6 overflow-x-auto">
                                                <code>{currentAssignment?.code_editor || '# Write your code here'}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Правая панель с редактором */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
                    <div className="h-full flex flex-col">
                        <div className="px-8 py-6 bg-gray-800 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="flex space-x-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-base font-medium text-gray-300">Python Editor</span>
                            </div>
                            <button className="px-5 py-2 bg-indigo-600 text-white text-base rounded-md hover:bg-indigo-700 transition-colors flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Run Code
                            </button>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <CodeEditor
                                initialCode={currentAssignment?.code_editor || ''}
                                onCodeChange={(code) => {
                                    console.log('Code changed:', code);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail; 