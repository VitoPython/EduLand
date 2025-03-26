import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiUser, HiMail, HiPhone, HiIdentification, HiAnnotation, HiSave } from 'react-icons/hi';
import api from '../api/api';

const StudentEdit = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        comment: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await api.get(`/students/${studentId}`);
                setStudent(response.data);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load student data');
                setIsLoading(false);
            }
        };
        fetchStudent();
    }, [studentId]);

    const handleChange = (e) => {
        setStudent({ ...student, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/students/${studentId}`, student);
            navigate(`/students`);
        } catch (err) {
            setError('Failed to update student');
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
            <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 transform hover:scale-105 transition-transform duration-200">
                    <Link
                        to={`/students/${studentId}`}
                        className="flex items-center text-purple-600 hover:text-purple-900 text-lg font-medium"
                    >
                        <HiArrowLeft className="mr-2 h-6 w-6" />
                        Back to Student Profile
                    </Link>
                </div>

                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-purple-100">
                    <div className="px-8 py-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-10">
                            Edit Student Profile
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
                                {/* Username field */}
                                <div className="col-span-2 group">
                                    <label className="block text-lg font-medium text-gray-700 mb-3 flex items-center group-hover:text-purple-600 transition-colors duration-200">
                                        <HiIdentification className="h-6 w-6 text-purple-400 mr-2 group-hover:text-purple-600" />
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={student.username}
                                        onChange={handleChange}
                                        className="form-input py-3 px-4 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-colors duration-200"
                                    />
                                </div>

                                {/* First Name field */}
                                <div className="group">
                                    <label className="block text-lg font-medium text-gray-700 mb-3 flex items-center group-hover:text-pink-600 transition-colors duration-200">
                                        <HiUser className="h-6 w-6 text-pink-400 mr-2 group-hover:text-pink-600" />
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={student.first_name}
                                        onChange={handleChange}
                                        className="form-input py-3 px-4 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 hover:border-pink-300 transition-colors duration-200"
                                    />
                                </div>

                                {/* Last Name field */}
                                <div className="group">
                                    <label className="block text-lg font-medium text-gray-700 mb-3 flex items-center group-hover:text-pink-600 transition-colors duration-200">
                                        <HiUser className="h-6 w-6 text-pink-400 mr-2 group-hover:text-pink-600" />
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={student.last_name}
                                        onChange={handleChange}
                                        className="form-input py-3 px-4 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 hover:border-pink-300 transition-colors duration-200"
                                    />
                                </div>

                                {/* Email field */}
                                <div className="group">
                                    <label className="block text-lg font-medium text-gray-700 mb-3 flex items-center group-hover:text-blue-600 transition-colors duration-200">
                                        <HiMail className="h-6 w-6 text-blue-400 mr-2 group-hover:text-blue-600" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={student.email}
                                        onChange={handleChange}
                                        className="form-input py-3 px-4 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors duration-200"
                                    />
                                </div>

                                {/* Phone field */}
                                <div className="group">
                                    <label className="block text-lg font-medium text-gray-700 mb-3 flex items-center group-hover:text-blue-600 transition-colors duration-200">
                                        <HiPhone className="h-6 w-6 text-blue-400 mr-2 group-hover:text-blue-600" />
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={student.phone}
                                        onChange={handleChange}
                                        className="form-input py-3 px-4 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors duration-200"
                                    />
                                </div>

                                {/* Comment field */}
                                <div className="col-span-2 group">
                                    <label className="block text-lg font-medium text-gray-700 mb-3 flex items-center group-hover:text-green-600 transition-colors duration-200">
                                        <HiAnnotation className="h-6 w-6 text-green-400 mr-2 group-hover:text-green-600" />
                                        Comment
                                    </label>
                                    <textarea
                                        name="comment"
                                        rows={4}
                                        value={student.comment}
                                        onChange={handleChange}
                                        className="form-textarea py-3 px-4 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-300 transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/students/${studentId}`)}
                                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-105 transition-all duration-200"
                                >
                                    <HiSave className="h-5 w-5 mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentEdit; 