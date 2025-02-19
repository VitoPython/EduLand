import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useAssignmentStore } from '../stores/assignmentStore';
import { useLessonStore } from '../stores/lessonStore';
import { useUIStore } from '../stores/uiStore';
import AssignmentModal from '../_components/AssignmentModal';

const Assignments = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    
    const { currentLesson, fetchLesson } = useLessonStore();
    
    const {
        assignments,
        isLoading,
        fetchAssignments,
        createAssignment,
        updateAssignment,
        deleteAssignment
    } = useAssignmentStore();

    const { modals, openModal, closeModal } = useUIStore();

    useEffect(() => {
        if (!lessonId) {
            navigate('/courses');
            return;
        }
        fetchLesson(lessonId);
        fetchAssignments(lessonId);
    }, [lessonId, navigate, fetchLesson, fetchAssignments]);

    const handleCreate = () => {
        openModal('assignment');
    };

    const handleEdit = (assignment) => {
        openModal('assignment', assignment);
    };

    const handleModalSubmit = async (assignmentData) => {
        try {
            if (modals.assignment.selectedAssignment) {
                await updateAssignment(modals.assignment.selectedAssignment.id, assignmentData);
            } else {
                await createAssignment(lessonId, assignmentData);
            }
            closeModal('assignment');
        } catch (error) {
            console.error('Error saving assignment:', error);
            alert('Failed to save assignment');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await deleteAssignment(id);
            } catch (error) {
                console.error('Error deleting assignment:', error);
                alert('Failed to delete assignment');
            }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex items-center space-x-2">
                <button
                    onClick={() => navigate(`/courses/${courseId}/lessons`)}
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Lessons
                </button>
            </div>

            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {currentLesson?.title || 'Loading...'} - Assignments
                    </h1>
                </div>
                <button
                    onClick={handleCreate}
                    className="mt-3 sm:mt-0 w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                    Add Assignment
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
                                    {assignments.map((assignment) => (
                                        <tr 
                                            key={assignment.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                console.log('Navigating to assignment:', assignment.id);
                                                navigate(`/courses/${courseId}/lessons/${lessonId}/assignments/${assignment.id}`);
                                            }}
                                        >
                                            <td className="w-[60%] py-4 pl-6 pr-3">
                                                <div className="text-left text-sm font-medium text-gray-900 truncate">
                                                    {assignment.title}
                                                </div>
                                            </td>
                                            <td className="w-[20%] px-3 py-4">
                                                <div className="text-left text-sm text-gray-500">
                                                    {new Date(assignment.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="w-[20%] py-4 pl-3 pr-6">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(assignment);
                                                        }}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(assignment.id);
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

            {modals.assignment.isOpen && (
                <AssignmentModal
                    assignment={modals.assignment.selectedAssignment}
                    onClose={() => closeModal('assignment')}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default Assignments; 