import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../stores/courseStore';
import { useUIStore } from '../stores/uiStore';
import CourseModal from '../_components/CourseModal';

const Courses = () => {
    const navigate = useNavigate();
    const { courses, isLoading, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourseStore();
    const { modals, openModal, closeModal } = useUIStore();

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await deleteCourse(id);
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('Failed to delete course');
            }
        }
    };

    const handleCreate = () => {
        openModal('course');
    };

    const handleEdit = (course) => {
        openModal('course', course);
    };

    const handleModalClose = () => {
        closeModal();
    };

    const handleModalSubmit = async (courseData) => {
        try {
            if (modals.selectedCourse) {
                await updateCourse(modals.selectedCourse.id, courseData);
            } else {
                await createCourse(courseData);
            }
            handleModalClose();
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Failed to save course');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                <button
                    onClick={handleCreate}
                    className="mt-3 sm:mt-0 w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                    Add Course
                </button>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                            <table className="min-w-full table-fixed divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="w-[60%] py-3.5 pl-6 pr-3">
                                            <div className="text-left text-sm font-semibold text-gray-900">
                                                Title
                                            </div>
                                        </th>
                                        <th scope="col" className="w-[20%] px-3 py-3.5">
                                            <div className="text-left text-sm font-semibold text-gray-900">
                                                Created At
                                            </div>
                                        </th>
                                        <th scope="col" className="w-[20%] py-3.5 pl-3 pr-6">
                                            <div className="text-right text-sm font-semibold text-gray-900">
                                                Actions
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {courses.map((course) => (
                                        <tr 
                                            key={course.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/courses/${course.id}/lessons`)}
                                        >
                                            <td className="w-[60%] py-4 pl-6 pr-3">
                                                <div className="text-left text-sm font-medium text-gray-900 truncate">
                                                    {course.title}
                                                </div>
                                            </td>
                                            <td className="w-[20%] px-3 py-4">
                                                <div className="text-left text-sm text-gray-500">
                                                    {new Date(course.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="w-[20%] py-4 pl-3 pr-6">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(course);
                                                        }}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(course.id);
                                                        }}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {modals.course.isOpen && (
                <CourseModal
                    course={modals.course.selectedCourse}
                    onClose={() => closeModal('course')}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default Courses; 