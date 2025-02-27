import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    HiAcademicCap, 

    HiChevronLeft,
    HiBookOpen,
    HiChartBar,
    HiUserCircle,
    HiPencil,
    HiCheckCircle
} from 'react-icons/hi';
import StudentCourses from '../components/StudentCourses';
import EnrollmentForm from '../components/EnrollmentForm';
import { useStudentStore } from '../stores/studentStore';

const StudentDetail = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { currentStudent, isLoading, error, fetchStudent } = useStudentStore();
    const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

    useEffect(() => {
        if (studentId) {
            fetchStudent(studentId);
        }
    }, [studentId, fetchStudent]);

    // Добавим подсчет активных и завершенных курсов
    const activeCourses = currentStudent?.enrollments?.filter(e => e.status === 'active').length || 0;
    const completedCourses = currentStudent?.enrollments?.filter(e => e.status === 'completed').length || 0;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <div className="text-red-600">Error: {error}</div>
                <button
                    onClick={() => navigate('/students')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                >
                    Back to Students List
                </button>
            </div>
        );
    }

    if (isLoading || !currentStudent) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/students"
                            className="flex items-center text-white hover:text-indigo-100 transition-colors duration-200"
                        >
                            <HiChevronLeft className="h-6 w-6" />
                            <span className="ml-2 font-medium">Back to Students</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    {/* Основная информация */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                                <div className="flex items-center text-white">
                                    <HiUserCircle className="h-6 w-6" />
                                    <h2 className="ml-2 text-xl font-semibold">Personal Info</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <dl className="divide-y divide-gray-200">
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Username</dt>
                                        <dd className="text-sm text-gray-900">{currentStudent.username}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">First Name</dt>
                                        <dd className="text-sm text-gray-900">{currentStudent.first_name}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                                        <dd className="text-sm text-gray-900">{currentStudent.last_name}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900">{currentStudent.email}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                        <dd className="text-sm text-gray-900">{currentStudent.phone}</dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                currentStudent.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {currentStudent.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="py-3 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                                        <dd className="text-sm text-gray-900">
                                            {new Date(currentStudent.created_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div className="py-3">
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Comment</dt>
                                        <dd className="text-sm text-gray-900 break-words">
                                            {currentStudent.comment || 'No comment'}
                                        </dd>
                                    </div>
                                </dl>
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate(`/students/${studentId}/edit`)}
                                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <HiPencil className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Статистика */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <HiCheckCircle className="h-8 w-8 opacity-80" />
                            <span className="text-2xl font-bold">{completedCourses}</span>
                        </div>
                        <p className="mt-2 text-sm opacity-90">Completed Courses</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <HiBookOpen className="h-8 w-8 opacity-80" />
                            <span className="text-2xl font-bold">{activeCourses}</span>
                        </div>
                        <p className="mt-2 text-sm opacity-90">Active Courses</p>
                    </div>
                </div>

                {/* Курсы и прогресс */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 flex justify-between items-center">
                        <div className="flex items-center text-white">
                            <HiAcademicCap className="h-6 w-6" />
                            <h2 className="ml-2 text-xl font-semibold">Enrolled Courses</h2>
                        </div>
                        <button
                            onClick={() => setShowEnrollmentForm(!showEnrollmentForm)}
                            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200 font-medium text-sm"
                        >
                            {showEnrollmentForm ? 'Cancel' : '+ Enroll in Course'}
                        </button>
                    </div>
                    <div className="p-6">
                        {showEnrollmentForm ? (
                            <EnrollmentForm
                                studentId={studentId}
                                onEnrollmentComplete={() => setShowEnrollmentForm(false)}
                            />
                        ) : (
                            <StudentCourses studentId={studentId} />
                        )}
                    </div>
                </div>

                {/* График прогресса */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500">
                        <div className="flex items-center text-white">
                            <HiChartBar className="h-6 w-6" />
                            <h2 className="ml-2 text-xl font-semibold">Learning Progress</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        {currentStudent.courses?.map(course => (
                            <div key={course.id} className="mb-4 last:mb-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700">{course.title}</span>
                                    <span className="text-sm text-gray-500">{course.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail; 