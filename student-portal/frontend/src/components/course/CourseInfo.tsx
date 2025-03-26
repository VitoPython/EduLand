import React from 'react';

interface CourseInfoProps {
    title: string;
    description: string;
    duration: number;
    price: number;
    created_at: string;
}

const CourseInfo: React.FC<CourseInfoProps> = ({ title, description, duration, price, created_at }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-100">
                <div className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-500 mt-1">Начало курса: {new Date(created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-8 py-6">
                <div className="space-y-6">
                    <div className="prose prose-blue max-w-none">
                        <p className="text-gray-600">{description}</p>
                    </div>
                    <div className="flex items-center space-x-8 border-t border-gray-100 pt-6">
                        <div className="flex items-center text-gray-500">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Длительность</p>
                                <p className="text-sm font-medium text-gray-900">{duration} часов</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-500">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Стоимость</p>
                                <p className="text-sm font-medium text-gray-900">${price}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseInfo; 