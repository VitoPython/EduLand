import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourseStore } from '../stores/courseStore';
import EditModal from '../_components/editModal';
import { HiChevronLeft, HiAcademicCap } from 'react-icons/hi';
import api from '../api/api';

const Lessons = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { currentCourse, fetchCourse, isLoading, error } = useCourseStore();
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [totalLessons, setTotalLessons] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Загружаем курс
                await fetchCourse(courseId);
                
                // Изменяем URL для получения уроков
                const response = await api.get(`/lessons/course/${courseId}`); // было /courses/${courseId}/lessons
                console.log('Loaded lessons:', response.data);
                const processedLessons = response.data.map(lesson => ({
                    ...lesson,
                    _id: lesson._id || lesson.id
                }));
                setLessons(processedLessons);
                setTotalLessons(processedLessons.length);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, [courseId, fetchCourse]);

    const handleCreate = () => {
        setSelectedLesson({ title: '' });
    };

    const handleEdit = (e, lesson) => {
        e.stopPropagation();
        // Сохраняем полные данные урока для редактирования
        setSelectedLesson({
            _id: lesson._id || lesson.id,
            title: lesson.title,
            course_id: lesson.course_id
        });
    };

    const handleDelete = async (e, lesson) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this lesson?')) {
            try {
                const id = lesson._id || lesson.id || lesson;
                const response = await api.delete(`/lessons/${id}`);
                console.log('Delete response:', response);

                if (response.status === 200) {
                    // Обновляем список уроков после успешного удаления
                    const lessonsResponse = await api.get(`/lessons/course/${courseId}`); // было /courses/${courseId}/lessons
                    setLessons(lessonsResponse.data);
                } else {
                    console.error('Failed to delete lesson');
                }
            } catch (error) {
                console.error('Error deleting lesson:', error);
            }
        }
    };

    const handleModalSubmit = async (lessonData) => {
        try {
            if (selectedLesson._id) {
                // Редактирование существующего урока
                console.log('Updating lesson:', selectedLesson._id, lessonData);
                await api.put(`/lessons/${selectedLesson._id}`, {
                    title: lessonData.title,
                    updated_at: new Date()
                });
            } else {
                // Создание нового урока
                console.log('Creating lesson with data:', { ...lessonData, course_id: courseId });
                await api.post(`/lessons/${courseId}`, { // было /lessons
                    ...lessonData,
                    course_id: courseId
                });
            }
            setSelectedLesson(null);
            
            // Обновляем список уроков
            const lessonsResponse = await api.get(`/lessons/course/${courseId}`); // было /courses/${courseId}/lessons
            console.log('Updated lessons:', lessonsResponse.data);
            setLessons(lessonsResponse.data);
        } catch (error) {
            console.error('Error saving lesson:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-center py-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link
                    to="/courses"
                    className="flex items-center text-indigo-600 hover:text-indigo-900"
                >
                    <HiChevronLeft className="h-5 w-5" />
                    <span>Back to Courses</span>
                </Link>
            </div>

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {currentCourse?.title} - Lessons
                    </h1>
                    <div className="flex items-center mt-2 text-sm text-gray-700">
                        <HiAcademicCap className="h-5 w-5 mr-1 text-indigo-600" />
                        <span>Total Lessons: {totalLessons}</span>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Lesson
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
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {lessons.map((lesson) => {
                                        // Проверяем наличие _id
                                        if (!lesson._id) {
                                            console.error('Lesson without _id:', lesson);
                                            return null;
                                        }
                                        
                                        return (
                                            <tr 
                                                key={lesson._id}
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => {
                                                    console.log('Navigating to assignments with lesson:', lesson);
                                                    if (lesson._id) {
                                                        navigate(`/courses/${courseId}/lessons/${lesson._id}/assignments`);
                                                    } else {
                                                        console.error('Cannot navigate: lesson._id is undefined', lesson);
                                                    }
                                                }}
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {lesson.title}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {new Date(lesson.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={(e) => handleEdit(e, lesson)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(e, lesson)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selectedLesson && (
                <EditModal
                    title={selectedLesson._id ? "Edit Lesson" : "Create Lesson"}
                    fields={[
                        { name: 'title', label: 'Title', type: 'text', required: true }
                    ]}
                    initialData={selectedLesson}
                    onClose={() => setSelectedLesson(null)}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default Lessons; 