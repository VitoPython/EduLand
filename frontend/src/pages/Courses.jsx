import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../stores/courseStore';
import EditModal from '../_components/editModal';
import { useState } from 'react';

const Courses = () => {
    const navigate = useNavigate();
    const { courses, isLoading, error, fetchCourses, createCourse, deleteCourse, updateCourse } = useCourseStore();
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleEdit = (e, course) => {
        e.stopPropagation();
        setSelectedCourse(course);
    };

    const handleDelete = async (e, courseId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await deleteCourse(courseId);
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const handleCreate = () => {
        setSelectedCourse({ title: '', description: '', duration: '', price: '' });
    };

    const handleModalSubmit = async (courseData) => {
        try {
            if (selectedCourse.id) {
                await updateCourse(selectedCourse.id, courseData);
            } else {
                await createCourse(courseData);
            }
            setSelectedCourse(null);
        } catch (error) {
            console.error('Error saving course:', error);
        }
    };

    if (error) {
        return (
            <div className="text-red-600 text-center py-4">
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
                    <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all courses including their title, description, duration and price.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Course
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
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration (hours)</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price ($)</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Updated</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
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
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{course.title}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{course.description}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{course.duration}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${course.price}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(course.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(course.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={(e) => handleEdit(e, course)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, course.id)}
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

            {selectedCourse && (
                <EditModal
                    title={selectedCourse.id ? "Edit Course" : "Create Course"}
                    fields={[
                        { name: 'title', label: 'Title', type: 'text', required: true },
                        { name: 'description', label: 'Description', type: 'textarea', required: true },
                        { name: 'duration', label: 'Duration (hours)', type: 'number', required: true },
                        { name: 'price', label: 'Price', type: 'number', required: true }
                    ]}
                    initialData={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default Courses; 