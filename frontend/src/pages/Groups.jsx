import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import { HiPencil, HiTrash, HiUserGroup, HiAcademicCap, HiClock, HiGlobe } from 'react-icons/hi';

const Groups = () => {
    const navigate = useNavigate();
    const { groups, isLoading, error, fetchGroups, deleteGroup } = useGroupStore();

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleDelete = async (groupId, groupName) => {
        if (window.confirm(`Are you sure you want to delete group "${groupName}"?`)) {
            try {
                await deleteGroup(groupId);
            } catch (error) {
                console.error('Error deleting group:', error);
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

    if (error) {
        return (
            <div className="text-red-600 text-center py-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all study groups including their details and student count.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={() => navigate('/groups/create')}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        Create Group
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
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Students</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Progress</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Language</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Date</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {Array.isArray(groups) && groups.map((group) => (
                                        <tr 
                                            key={group._id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/groups/${group._id}`)}
                                        >
                                            <td 
                                                className="whitespace-nowrap px-3 py-4 text-sm text-gray-900"
                                                
                                            >
                                                {group.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    group.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {group.type}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <HiUserGroup className="mr-1.5 h-5 w-5 text-gray-400" />
                                                    {group.students_count}/{group.max_students}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <HiAcademicCap className="mr-1.5 h-5 w-5 text-gray-400" />
                                                    {group.lessons_completed}/{group.total_lessons}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <HiClock className="mr-1.5 h-5 w-5 text-gray-400" />
                                                    {group.lesson_duration} min
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <HiGlobe className="mr-1.5 h-5 w-5 text-gray-400" />
                                                    {group.language}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Date(group.start_date).toLocaleDateString()}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/groups/${group._id}/edit`);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <HiPencil className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(group._id, group.name);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <HiTrash className="h-5 w-5" />
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
        </div>
    );
};

export default Groups; 