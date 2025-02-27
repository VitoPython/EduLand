import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGroupStore } from '../stores/groupStore';
import { useCourseStore } from '../stores/courseStore';
import { HiChevronLeft, HiUserGroup, HiClock, HiGlobe, HiSparkles, HiChip } from 'react-icons/hi';

const GroupForm = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { createGroup, updateGroup, currentGroup, fetchGroup, isLoading } = useGroupStore();
    const { courses, fetchCourses } = useCourseStore();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Regular group',
        is_premium: false,
        ai_review: false,
        max_students: 14,
        min_age: 10,
        max_age: 12,
        lesson_duration: 90,
        language: 'Polish',
        funnel: 'EU | Poland',
        start_date: '',
        timezone: 'Europe/Warsaw',
        course_id: '',
        lessons_completed: 0,
        total_lessons: 32
    });

    useEffect(() => {
        fetchCourses();
        if (groupId) {
            fetchGroup(groupId);
        }
    }, [groupId, fetchCourses, fetchGroup]);

    useEffect(() => {
        if (groupId && currentGroup) {
            setFormData({
                ...currentGroup,
                start_date: new Date(currentGroup.start_date).toISOString().split('T')[0]
            });
        }
    }, [currentGroup, groupId]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const groupData = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString()
            };
            if (groupId) {
                await updateGroup(groupId, groupData);
            } else {
                await createGroup(groupData);
            }
            navigate(`/groups/${groupId}`);
        } catch (error) {
            console.error('Error saving group:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back button */}
                <Link
                    to={`/groups/${groupId}`}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-all duration-200 mb-8 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
                >
                    <HiChevronLeft className="h-5 w-5" />
                    <span className="font-medium">Back to Group</span>
                </Link>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">
                            {groupId ? 'Edit Group' : 'Create New Group'}
                        </h2>
                        <p className="mt-2 text-indigo-100">
                            {groupId ? 'Update your group settings' : 'Set up a new study group'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Group Details Section */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <HiUserGroup className="h-6 w-6 text-indigo-500 mr-2" />
                                Group Details
                            </h3>
                            <div className="space-y-4">
                                {/* Group Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Group Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                        placeholder="Enter group name"
                                    />
                                </div>

                                {/* Course Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="course_id"
                                            value={formData.course_id}
                                            onChange={handleChange}
                                            required
                                            className="appearance-none block w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                backgroundPosition: 'right 1rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.5em 1.5em',
                                                paddingRight: '3rem'
                                            }}
                                        >
                                            <option value="" className="text-gray-500">
                                                Select a course...
                                            </option>
                                            {courses?.map(course => (
                                                <option 
                                                    key={course.id} 
                                                    value={course.id}
                                                    className="py-2 px-3 text-gray-900 hover:bg-indigo-50"
                                                >
                                                    {course.name || course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Time Section */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <HiClock className="h-6 w-6 text-purple-500 mr-2" />
                                Location & Time
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Language and Timezone inputs */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Language</label>
                                        <div className="mt-1 relative rounded-lg shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <HiGlobe className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="language"
                                                value={formData.language}
                                                onChange={handleChange}
                                                required
                                                className="pl-10 block w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Timezone</label>
                                        <input
                                            type="text"
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Start Date and Duration */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Lesson Duration (minutes)</label>
                                        <input
                                            type="number"
                                            name="lesson_duration"
                                            value={formData.lesson_duration}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Age Requirements Section */}
                        <div className="bg-gradient-to-r from-pink-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <HiUserGroup className="h-6 w-6 text-pink-500 mr-2" />
                                Age Requirements
                            </h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Minimum Age</label>
                                    <input
                                        type="number"
                                        name="min_age"
                                        value={formData.min_age}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Maximum Age</label>
                                    <input
                                        type="number"
                                        name="max_age"
                                        value={formData.max_age}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Features Section */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <HiSparkles className="h-6 w-6 text-indigo-500 mr-2" />
                                Additional Features
                            </h3>
                            <div className="space-y-4">
                                <label className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_premium"
                                        checked={formData.is_premium}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <div className="ml-3">
                                        <span className="text-sm font-medium text-gray-900">Premium Group</span>
                                        <p className="text-sm text-gray-500">Enable premium features and support</p>
                                    </div>
                                    <HiSparkles className="ml-auto h-6 w-6 text-indigo-500" />
                                </label>

                                <label className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="ai_review"
                                        checked={formData.ai_review}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <div className="ml-3">
                                        <span className="text-sm font-medium text-gray-900">AI Review</span>
                                        <p className="text-sm text-gray-500">Enable AI-powered code review</p>
                                    </div>
                                    <HiChip className="ml-auto h-6 w-6 text-purple-500" />
                                </label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate(`/groups/${groupId}`)}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 border border-transparent rounded-lg shadow-sm hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </div>
                                ) : (
                                    groupId ? 'Save Changes' : 'Create Group'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GroupForm; 