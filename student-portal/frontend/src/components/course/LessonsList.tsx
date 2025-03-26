import React from 'react';
import { Link } from 'react-router-dom';
import { Assignment } from '../../types';

interface Lesson {
    _id: string;
    title: string;
    course_id: string;
    created_at: string;
    assignments: Assignment[];
}

interface LessonsListProps {
    lessons: Lesson[];
}

const LessonsList: React.FC<LessonsListProps> = ({ lessons }) => {
    console.log('LessonsList received lessons:', lessons);
    
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
            <div className="border-b border-gray-100">
                <div className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Уроки курса</h2>
                            <p className="text-sm text-gray-500 mt-1">Выберите урок для просмотра</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="divide-y divide-gray-100">
                {lessons.map((lesson, index) => (
                    <Link
                        key={lesson._id}
                        to={`/lessons/${lesson._id}`}
                        className="block hover:bg-gray-50 transition-colors duration-150"
                    >
                        <div className="px-8 py-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center text-indigo-600 font-semibold">
                                    {index + 1}
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-medium text-gray-900">{lesson.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {lesson.assignments.length} заданий
                                            </p>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default LessonsList; 