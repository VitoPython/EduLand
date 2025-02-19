import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from "@clerk/clerk-react";

const HomePost = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        comment: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            // Получаем clerk_id из токена
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const userData = {
                ...user,
                clerk_id: tokenData.sub  // Добавляем clerk_id из токена
            };

            await api.post('/users', userData);
            alert('User registered successfully');
            navigate('/users');
        } catch (error) {
            console.error('Error creating user:', error);
            alert(error.response?.data?.detail || 'Error creating user');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                                            First name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="first-name"
                                                name="first_name"
                                                type="text"
                                                autoComplete="given-name"
                                                required
                                                value={user.first_name}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900">
                                            Last name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="last-name"
                                                name="last_name"
                                                type="text"
                                                autoComplete="family-name"
                                                required
                                                value={user.last_name}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                            Email address
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={user.email}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900">
                                            Mobile Phone
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                required
                                                value={user.phone}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="comment" className="block text-sm/6 font-medium text-gray-900">
                                            Comment
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                id="comment"
                                                name="comment"
                                                rows={4}
                                                value={user.comment}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="submit"
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/users')}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                        >
                                            Go to Users
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePost;
