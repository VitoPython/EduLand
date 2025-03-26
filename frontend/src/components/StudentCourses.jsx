import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEnrollmentStore } from '../stores/enrollmentStore';
import { useCourseStore } from '../stores/courseStore';
import { 
    HiAcademicCap, 
    HiClock, 
    HiCheckCircle, 
    HiX,
    HiChartBar,
    HiCalendar,
    HiTrash
} from 'react-icons/hi';

const StudentCourses = ({ studentId }) => {
    const { enrollments, isLoading, fetchStudentEnrollments, deleteEnrollment, updateEnrollment } = useEnrollmentStore();
    const { courses, fetchCourses } = useCourseStore();

    useEffect(() => {
        fetchStudentEnrollments(studentId);
        fetchCourses();
    }, [studentId, fetchStudentEnrollments, fetchCourses]);

    const handleStatusUpdate = async (enrollmentId, newStatus) => {
        try {
            await updateEnrollment(enrollmentId, { status: newStatus });
        } catch (error) {
            console.error('Error updating enrollment:', error);
        }
    };

    const handleUnenroll = async (enrollmentId) => {
        if (window.confirm('Are you sure you want to unenroll from this course?')) {
            try {
                await deleteEnrollment(enrollmentId);
            } catch (error) {
                console.error('Error deleting enrollment:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (enrollments.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <HiAcademicCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No courses enrolled</h3>
                <p className="mt-2 text-sm text-gray-500">Get started by enrolling in your first course.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {enrollments.map(enrollment => {
                const course = courses.find(c => c.id === enrollment.course_id);
                if (!course) return null;

                const getStatusColor = (status) => {
                    switch (status) {
                        case 'active':
                            return 'bg-green-100 text-green-800 border-green-200';
                        case 'completed':
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                        case 'dropped':
                            return 'bg-red-100 text-red-800 border-red-200';
                        default:
                            return 'bg-gray-100 text-gray-800 border-gray-200';
                    }
                };

                const getStatusIcon = (status) => {
                    switch (status) {
                        case 'active':
                            return <HiClock className="h-4 w-4" />;
                        case 'completed':
                            return <HiCheckCircle className="h-4 w-4" />;
                        case 'dropped':
                            return <HiX className="h-4 w-4" />;
                        default:
                            return null;
                    }
                };

                return (
                    <div 
                        key={enrollment.id} 
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden"
                    >
                        {/* Course Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                            <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                        </div>

                        {/* Course Content */}
                        <div className="p-4 space-y-4">
                            {/* Status and Progress */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(enrollment.status)}`}>
                                        {getStatusIcon(enrollment.status)}
                                        <span className="ml-1 capitalize">{enrollment.status}</span>
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <HiChartBar className="h-4 w-4 mr-1" />
                                    <span>{enrollment.progress || 0}% Complete</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                />
                            </div>

                            {/* Enrollment Date */}
                            <div className="flex items-center text-sm text-gray-500">
                                <HiCalendar className="h-4 w-4 mr-1" />
                                <span>Enrolled on {new Date(enrollment.start_date).toLocaleDateString()}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <select
                                    value={enrollment.status}
                                    onChange={(e) => handleStatusUpdate(enrollment.id, e.target.value)}
                                    className="text-sm rounded-lg border border-gray-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="dropped">Dropped</option>
                                </select>

                                <button
                                    onClick={() => handleUnenroll(enrollment.id)}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200"
                                >
                                    <HiTrash className="h-4 w-4 mr-1" />
                                    Unenroll
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

StudentCourses.propTypes = {
    studentId: PropTypes.string.isRequired
};

export default StudentCourses; 