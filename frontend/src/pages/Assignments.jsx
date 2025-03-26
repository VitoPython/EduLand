import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiChevronLeft } from 'react-icons/hi';
import { useAssignmentStore } from '../stores/assignmentStore';
import AssignmentModal from '../_components/AssignmentModal';

const Assignments = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { 
        assignments,
        isLoading,
        error,
        fetchAssignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        setSelectedAssignment,
        selectedAssignment 
    } = useAssignmentStore();

    useEffect(() => {
        const loadData = async () => {
            if (lessonId && lessonId !== 'undefined') {
                await fetchAssignments(lessonId);
            }
        };
        
        loadData();
    }, [lessonId, fetchAssignments]);

    const handleCreate = () => {
        setSelectedAssignment({
            title: '',
            code_editor: '',
            description: ''
        });
    };

    const handleEdit = (e, assignment) => {
        e.stopPropagation();
        setSelectedAssignment(assignment);
    };

    const handleDelete = async (e, assignment) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await deleteAssignment(assignment.id);
                await fetchAssignments(lessonId);
            } catch (error) {
                console.error('Error deleting assignment:', error);
            }
        }
    };

    const handleModalSubmit = async (assignmentData) => {
        try {
            if (selectedAssignment.id) {
                await updateAssignment({
                    ...assignmentData,
                    id: selectedAssignment.id
                });
            } else {
                const newAssignment = {
                    title: assignmentData.title,
                    description: assignmentData.description || '',
                    code_editor: assignmentData.code_editor || '',
                    lesson_id: lessonId
                };
                
                await createAssignment(lessonId, newAssignment);
            }
            
            setSelectedAssignment(null);
            await fetchAssignments(lessonId);
            
        } catch (error) {
            console.error('Error saving assignment:', error);
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

    console.log('Current assignments:', assignments);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link
                    to={`/courses/${courseId}/lessons`}
                    className="flex items-center text-indigo-600 hover:text-indigo-900"
                >
                    <HiChevronLeft className="h-5 w-5" />
                    <span>Back to Lessons</span>
                </Link>
            </div>

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Assignments</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all assignments in this lesson.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        Add Assignment
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
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            №
                                        </th>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                            Title
                                        </th>

                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {assignments.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-gray-500">
                                                No assignments found. Click &quot;Add Assignment&quot; to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        assignments.map((assignment, index) => {
                                            console.log('Rendering assignment:', assignment);
                                            return (
                                                <tr 
                                                    key={assignment.id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}/assignments/${assignment.id}`)}
                                                >
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        {index + 1}
                                                    </td>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                        {assignment.title}
                                                    </td>

                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            onClick={(e) => handleEdit(e, assignment)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(e, assignment)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selectedAssignment && (
                <AssignmentModal
                    assignment={selectedAssignment}
                    onClose={() => setSelectedAssignment(null)}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default Assignments; 