import React from 'react';
import { Link } from 'react-router-dom';

interface Assignment {
    _id: string;
    title: string;
    lesson_id: string;
    created_at: string;
    updated_at: string;
}

interface AssignmentsListProps {
    assignments: Assignment[];
    lessonTitle: string;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({ assignments, lessonTitle }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
            <div className="border-b border-gray-100">
                <div className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Задания урока</h2>
                            <p className="text-sm text-gray-500 mt-1">{lessonTitle}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="divide-y divide-gray-100">
                {assignments.length > 0 ? (
                    assignments.map((assignment, index) => (
                        <Link
                            key={assignment._id}
                            to={`/assignments/${assignment._id}`}
                            className="block hover:bg-gray-50 transition-colors duration-150"
                        >
                            <div className="px-8 py-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                                        {index + 1}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-base font-medium text-gray-900">{assignment.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Обновлено: {new Date(assignment.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    Готово к выполнению
                                                </span>
                                                <svg className="w-5 h-5 text-gray-400 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="px-8 py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Нет заданий</h3>
                        <p className="mt-1 text-sm text-gray-500">В этом уроке пока нет заданий.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentsList; 