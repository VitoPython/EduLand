import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import { useCourseStore } from '../stores/courseStore';
import { useLessonStore } from '../stores/lessonStore';
import { useAuth } from "@clerk/clerk-react";
import AddStudentModal from '../components/AddStudentModal';
import AttendanceTable from '../components/AttendanceTable';
import GradesTable from '../components/GradesTable';
import api from '../services/api';
import { Select, Spin } from 'antd';
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
import SubmitsTable from '../components/SubmitsTable';

const { Option } = Select;

const GroupDetail = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { getToken } = useAuth();
    const { currentGroup, fetchGroup, removeStudentFromGroup } = useGroupStore();
    const { courses, fetchCourses } = useCourseStore();
    const { fetchLessons, lessons } = useLessonStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(true);

    // Загрузка данных группы и курсов
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchGroup(groupId),
                    fetchCourses()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [groupId, fetchGroup, fetchCourses]);

    // Установка текущего курса при изменении группы или списка курсов
    useEffect(() => {
        if (currentGroup?.course_id && courses.length > 0) {
            const course = courses.find(c => c.id === currentGroup.course_id);
            setCurrentCourse(course);
        }
    }, [currentGroup, courses]);

    // Загрузка уроков при изменении курса
    useEffect(() => {
        if (currentCourse?.id) {
            fetchLessons(currentCourse.id);
        }
    }, [currentCourse, fetchLessons]);

    // Загрузка заданий для урока
    const fetchAssignmentsForLesson = async (lessonId) => {
        try {
            const token = await getToken();
            const response = await api.get(`/assignments/lessons/${lessonId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAssignments(response.data);
            if (response.data.length > 0) {
                setCurrentAssignment(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    // Обработчик изменения урока
    const handleLessonChange = async (lessonId) => {
        await fetchAssignmentsForLesson(lessonId);
    };

    // Обработчик изменения задания
    const handleAssignmentChange = (assignmentId) => {
        const selected = assignments.find(a => a.id === assignmentId);
        setCurrentAssignment(selected);
    };

    // Обработчик удаления студента
    const handleRemoveStudent = async (studentId, studentName) => {
        if (window.confirm(`Are you sure you want to remove ${studentName} from the group?`)) {
            try {
                await removeStudentFromGroup(groupId, studentId);
                await fetchGroup(groupId); // Обновляем данные группы после удаления
            } catch (error) {
                console.error('Error removing student:', error);
            }
        }
    };

    // Обновленный компонент выбора урока и задания
    const renderAssignmentSelector = () => {
        return (
            <div className="mb-6 space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Lesson
                            </label>
                            <Select
                                className="w-full"
                                onChange={handleLessonChange}
                                placeholder="Choose a lesson"
                            >
                                {lessons.map(lesson => (
                                    <Option key={lesson.id} value={lesson.id}>
                                        {lesson.title}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Assignment
                            </label>
                            <Select
                                className="w-full"
                                onChange={handleAssignmentChange}
                                value={currentAssignment?.id}
                                placeholder="Choose an assignment"
                                disabled={!assignments.length}
                            >
                                {assignments.map(assignment => (
                                    <Option key={assignment.id} value={assignment.id}>
                                        {assignment.title}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Вычисляем прогресс группы
    const groupProgress = currentGroup?.total_lessons 
        ? Math.round((currentGroup.lessons_completed / currentGroup.total_lessons) * 100)
        : 0;

    return (
        loading ? (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        ) : (
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
                                    <h1 className="text-2xl font-bold text-white mb-2">{currentGroup?.name}</h1>
                                    <p className="text-indigo-100 flex items-center">
                                        <HiAcademicCap className="h-5 w-5 mr-2" />
                                        {currentCourse ? currentCourse.title : 'No course assigned'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center"
                                >
                                    <HiUserAdd className="h-5 w-5 mr-2" />
                                    Add Student
                                </button>
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
                                            currentGroup?.is_premium 
                                                ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {currentGroup?.type || (currentGroup?.is_premium ? 'Premium' : 'Regular')} Group
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Students</span>
                                        <span className="text-gray-900">{currentGroup?.students?.length || 0}/{currentGroup?.max_students}</span>
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
                                        Start Date: {currentGroup?.start_date ? new Date(currentGroup.start_date).toLocaleDateString() : 'Not set'}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <HiClock className="h-5 w-5 mr-2" />
                                        Duration: {currentGroup?.lesson_duration || 0} minutes
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <HiLocationMarker className="h-5 w-5 mr-2" />
                                        Timezone: {currentGroup?.timezone || 'Not set'}
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
                                        AI Review: {currentGroup?.ai_review ? 'Enabled' : 'Disabled'}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <HiUserGroup className="h-5 w-5 mr-2" />
                                        Age Range: {currentGroup?.min_age || 0}-{currentGroup?.max_age || 0} years
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs and Content */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className={`${
                                        activeTab === 'students'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    Students
                                </button>
                                <button
                                    onClick={() => setActiveTab('attendance')}
                                    className={`${
                                        activeTab === 'attendance'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    Attendance
                                </button>
                                <button
                                    onClick={() => setActiveTab('grades')}
                                    className={`${
                                        activeTab === 'grades'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    Grades
                                </button>
                                <button
                                    onClick={() => setActiveTab('submits')}
                                    className={`${
                                        activeTab === 'submits'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    Submissions
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'students' && (
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
                                            {currentGroup?.students?.map((student) => (
                                                <tr 
                                                    key={student.student_id}
                                                    onClick={() => navigate(`/students/${student.student_id}`)}
                                                    className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {student.first_name} {student.last_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">{student.email}</div>
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
                                                            {student.status || 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'Recently'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveStudent(student.student_id, `${student.first_name} ${student.last_name}`);
                                                            }}
                                                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                                        >
                                                            <HiTrash className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {activeTab === 'attendance' && (
                                <AttendanceTable 
                                    groupId={groupId} 
                                    students={currentGroup?.students}
                                    courseName={currentCourse?.title}
                                    totalLessonsCount={lessons.length}
                                />
                            )}
                            {activeTab === 'grades' && (
                                <div>
                                    {renderAssignmentSelector()}
                                    {currentAssignment && currentGroup?.students && (
                                        <GradesTable
                                            assignmentId={currentAssignment.id}
                                            assignmentName={currentAssignment.title}
                                            students={currentGroup.students}
                                        />
                                    )}
                                </div>
                            )}
                            {activeTab === 'submits' && (
                                <div>
                                    {renderAssignmentSelector()}
                                    <SubmitsTable
                                        lessonId={currentAssignment?.lesson_id}
                                        assignments={currentAssignment ? [currentAssignment] : []}
                                        students={currentGroup?.students || []}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Student Modal */}
                    {isModalOpen && (
                        <AddStudentModal
                            groupId={groupId}
                            onClose={() => setIsModalOpen(false)}
                            onSuccess={() => {
                                setIsModalOpen(false);
                                fetchGroup(groupId);
                            }}
                        />
                    )}
                </div>
            </div>
        )
    );
};

export default GroupDetail;