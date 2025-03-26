import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import { useCourseStore } from '../stores/courseStore';
import { useLessonStore } from '../stores/lessonStore';
import AddStudentModal from '../components/AddStudentModal';
import AttendanceTable from '../components/AttendanceTable';

import {
    HiChevronLeft,
    HiUserGroup,
    HiAcademicCap,
    HiClock,
    HiCalendar,
    HiLocationMarker,
    HiSparkles,
    HiChip,
    HiTrash,
    HiUserAdd,
} from 'react-icons/hi';

const GroupDetail = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { currentGroup, fetchGroup, removeStudentFromGroup, isLoading: groupLoading } = useGroupStore();
    const { courses, fetchCourses, isLoading: coursesLoading } = useCourseStore();
    const { fetchLessons, lessons } = useLessonStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);

    useEffect(() => {
        console.log('Fetching group and courses');
        fetchGroup(groupId);
        fetchCourses();
    }, [groupId, fetchGroup, fetchCourses]);

    useEffect(() => {
        if (currentGroup?.course_id && courses.length > 0) {
            const course = courses.find(c => c.id === currentGroup.course_id);
            setCurrentCourse(course);
            console.log('Current course set:', course);
        }
    }, [currentGroup, courses]);

    useEffect(() => {
        if (currentCourse) {
            console.log('Fetching lessons for course:', currentCourse.id);
            fetchLessons(currentCourse.id);
        }
    }, [currentCourse, fetchLessons]);

    useEffect(() => {
        console.log('Lessons updated:', lessons);
        console.log('Total lessons count:', lessons.length);
    }, [lessons]);

    console.log('Rendering GroupDetail with lessons:', lessons);
    console.log('Total lessons count before passing to AttendanceTable:', lessons.length);

    if (!currentGroup) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const handleRemoveStudent = async (studentId, studentName) => {
        if (window.confirm(`Are you sure you want to remove ${studentName} from the group?`)) {
            await removeStudentFromGroup(groupId, studentId);
        }
    };


    // Вычисляем прогресс группы
    const groupProgress = currentGroup.total_lessons 
        ? Math.round((currentGroup.lessons_completed / currentGroup.total_lessons) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back button */}
                <Link
                    to="/groups"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-all duration-200 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
                >
                    <HiChevronLeft className="h-5 w-5 mr-1" />
                    Back to Groups
                </Link>

                {/* Group Header с прогресс-баром */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">{currentGroup.name}</h1>
                                <p className="text-indigo-100 flex items-center">
                                    <HiAcademicCap className="h-5 w-5 mr-2" />
                                    {currentCourse ? currentCourse.title : 'No course assigned'}
                                </p>
                            </div>
                            <Link
                                to={`/groups/${groupId}/edit`}
                                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200"
                            >
                                Edit Group
                            </Link>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-white/20 rounded-full h-2.5">
                            <div
                                className="bg-white h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${groupProgress}%` }}
                            />
                        </div>
                        <p className="text-white/80 text-sm mt-2">
                            Course Progress: {groupProgress}%
                        </p>
                    </div>

                    {/* Group Info Cards */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Basic Info Card */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <HiUserGroup className="h-6 w-6 text-indigo-500 mr-2" />
                                Group Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Type</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        currentGroup.is_premium 
                                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {currentGroup.type || (currentGroup.is_premium ? 'Premium' : 'Regular')} Group
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Students</span>
                                    <span className="text-gray-900">{currentGroup.students?.length || 0}/{currentGroup.max_students}</span>
                                </div>
                                {currentCourse && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Lessons</span>
                                        <span className="text-gray-900">{lessons.length}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schedule Info Card */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <HiClock className="h-6 w-6 text-purple-500 mr-2" />
                                Schedule
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-gray-600">
                                    <HiCalendar className="h-5 w-5 mr-2" />
                                    Start Date: {new Date(currentGroup.start_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <HiClock className="h-5 w-5 mr-2" />
                                    Duration: {currentGroup.lesson_duration} minutes
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <HiLocationMarker className="h-5 w-5 mr-2" />
                                    Timezone: {currentGroup.timezone}
                                </div>
                            </div>
                        </div>

                        {/* Features Card */}
                        <div className="bg-gradient-to-r from-pink-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <HiSparkles className="h-6 w-6 text-pink-500 mr-2" />
                                Features
                            </h3>
                            <div className="space-y-3">
                                {currentCourse && (
                                    <div className="flex items-center text-gray-600">
                                        <HiAcademicCap className="h-5 w-5 mr-2" />
                                        Course Duration: {currentCourse.duration} hours
                                    </div>
                                )}
                                <div className="flex items-center text-gray-600">
                                    <HiChip className="h-5 w-5 mr-2" />
                                    AI Review: {currentGroup.ai_review ? 'Enabled' : 'Disabled'}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <HiUserGroup className="h-5 w-5 mr-2" />
                                    Age Range: {currentGroup.min_age}-{currentGroup.max_age} years
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Students</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {currentGroup.students?.length || 0} of {currentGroup.max_students} spots filled
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={currentGroup.students?.length >= currentGroup.max_students}
                            className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                currentGroup.students?.length >= currentGroup.max_students
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600'
                            }`}
                        >
                            <HiUserAdd className="h-5 w-5 mr-2" />
                            Add Student
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentGroup.students?.map((student) => (
                                        <tr 
                                            key={student.student_id}
                                            onClick={() => navigate(`/students/${student.student_id}`)}
                                            className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                        >
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {student.first_name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {student.last_name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {student.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-32">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-medium text-gray-900">
                                                            {typeof student.progress === 'number' ? student.progress : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${typeof student.progress === 'number' ? student.progress : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    student.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {typeof student.status === 'string' ? student.status : 'active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'Recently'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveStudent(student.student_id, `${student.first_name} ${student.last_name}`);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                                >
                                                    <HiTrash className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <AddStudentModal
                        groupId={groupId}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}

                {/* Обновляем компонент AttendanceTable */}
                {currentGroup && (
                    <AttendanceTable 
                        groupId={groupId} 
                        students={currentGroup.students}
                        courseName={currentCourse?.title}
                        totalLessonsCount={lessons.length}
                    />
                )}
            </div>
        </div>
    );
};

export default GroupDetail;