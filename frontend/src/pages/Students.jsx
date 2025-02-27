import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../stores/studentStore';
import { useEnrollmentStore } from '../stores/enrollmentStore';
import { useCourseStore } from '../stores/courseStore';

const Students = () => {
    const navigate = useNavigate();
    const { students, isLoading, error, fetchStudents, deleteStudent } = useStudentStore();
    const { enrollments, fetchStudentEnrollments } = useEnrollmentStore();
    const { courses, fetchCourses } = useCourseStore();

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, [fetchStudents, fetchCourses]);

    const handleStudentClick = (studentId) => {
        navigate(`/students/${studentId}`);
    };

    const handleEdit = (e, studentId) => {
        e.stopPropagation(); // Предотвращаем всплытие события
        navigate(`/students/${studentId}/edit`);
    };

    const handleDelete = async (e, studentId) => {
        e.stopPropagation(); // Предотвращаем всплытие события
        if (window.confirm('Are you sure you want to delete this student?')) {
            await deleteStudent(studentId);
        }
    };

    const getStudentCourses = (studentId) => {
        const studentEnrollments = enrollments.filter(e => e.student_id === studentId);
        return studentEnrollments.map(e => {
            const course = courses.find(c => c.id === e.course_id);
            return course ? course.title : '';
        }).join(', ');
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                Error: {error}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all students including their name, email, phone and additional information.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={() => navigate('/register')}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Student
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="w-1/8 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Username</th>
                                        <th scope="col" className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">First Name</th>
                                        <th scope="col" className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Name</th>
                                        <th scope="col" className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th scope="col" className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                                        <th scope="col" className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Courses</th>
                                        <th scope="col" className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comment</th>
                                        <th scope="col" className="w-1/8 px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {students.map((student) => (
                                        <tr 
                                            key={student.id} 
                                            onClick={() => handleStudentClick(student.id)}
                                            className="cursor-pointer hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{student.username}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.first_name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.last_name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.email}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.phone}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getStudentCourses(student.id)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.comment}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                                                <button
                                                    onClick={(e) => handleEdit(e, student.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, student.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Students; 