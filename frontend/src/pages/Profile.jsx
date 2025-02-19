import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";

const Profile = () => {
    const { isLoaded, user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email_address: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            console.log("User Data:", user);
            setFormData({
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                email_address: user.primaryEmailAddress?.emailAddress || '',
            });
            setIsLoading(false);
        }
    }, [isLoaded, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await user.update({
                firstName: formData.first_name,
                lastName: formData.last_name,
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Unable to load user data. Please try again.
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-6 mb-6">
                    {user.imageUrl && (
                        <img
                            src={user.imageUrl}
                            alt="Profile"
                            className="h-24 w-24 rounded-full object-cover"
                        />
                    )}
                    <div>
                        <h2 className="text-2xl font-bold">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-gray-600">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Profile Information</h3>
                            <dl className="mt-4 space-y-4">
                                <div className="flex border-t border-gray-200 py-3">
                                    <dt className="w-1/4 text-gray-500">Full Name</dt>
                                    <dd className="w-3/4 text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </dd>
                                </div>
                                <div className="flex border-t border-gray-200 py-3">
                                    <dt className="w-1/4 text-gray-500">Email</dt>
                                    <dd className="w-3/4 text-gray-900">
                                        {user.primaryEmailAddress?.emailAddress}
                                    </dd>
                                </div>
                                {user.createdAt && (
                                    <div className="flex border-t border-gray-200 py-3">
                                        <dt className="w-1/4 text-gray-500">Created</dt>
                                        <dd className="w-3/4 text-gray-900">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile; 