import { useState } from 'react';
import PropTypes from 'prop-types';
import { useEnrollmentStore } from '../stores/enrollmentStore';
import { useCourseStore } from '../stores/courseStore';
import { HiAcademicCap, HiCheck, HiSelector } from 'react-icons/hi';

const EnrollmentForm = ({ studentId, onEnrollmentComplete }) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const { enrollStudent, isLoading } = useEnrollmentStore();
    const { courses } = useCourseStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) return;

        try {
            await enrollStudent(studentId, selectedCourseId);
            setSelectedCourseId('');
            if (onEnrollmentComplete) {
                onEnrollmentComplete();
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enroll in New Course</h3>
                <p className="text-sm text-gray-600">
                    Choose a course from the list below to start your learning journey.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <HiAcademicCap className="h-5 w-5 text-indigo-500 mr-2" />
                        Select Course
                    </label>
                    <div className="relative">
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white 
                                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                     transition-all duration-200 hover:border-indigo-300"
                            required
                        >
                            <option value="">Choose a course...</option>
                            {courses.map(course => (
                                <option 
                                    key={course.id} 
                                    value={course.id}
                                    className="py-2"
                                >
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        <HiSelector className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onEnrollmentComplete}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                                 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !selectedCourseId}
                        className={`
                            flex items-center justify-center px-6 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200 shadow-sm
                            ${isLoading || !selectedCourseId 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Enrolling...
                            </>
                        ) : (
                            <>
                                <HiCheck className="w-5 h-5 mr-2" />
                                Enroll Now
                            </>
                        )}
                    </button>
                </div>

                {/* Дополнительная информация */}
                <div className="mt-6 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <p className="text-sm text-indigo-700">
                        By enrolling in a course, you'll get access to:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-indigo-600">
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                            All course materials and resources
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                            Progress tracking and assignments
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                            Certificate upon completion
                        </li>
                    </ul>
                </div>
            </form>
        </div>
    );
};

EnrollmentForm.propTypes = {
    studentId: PropTypes.string.isRequired,
    onEnrollmentComplete: PropTypes.func
};

EnrollmentForm.defaultProps = {
    onEnrollmentComplete: () => {}
};

export default EnrollmentForm; 