import { useEffect, useState } from "react";
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import EditModal from '../_components/editModal';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            if (error.response?.status === 401) {
                navigate('/sign-in');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${id}`);
                setStudents(students.filter(student => student.id !== id));
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Failed to delete student');
            }
        }
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
    };

    const handleUpdate = async (updatedData) => {
        try {
            const response = await api.put(`/students/${selectedStudent.id}`, updatedData);
            setStudents(students.map(student => 
                student.id === selectedStudent.id ? response.data : student
            ));
            setSelectedStudent(null);
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Failed to update student');
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
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all students including their name, email, phone and additional information.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={() => navigate('/register')}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Student
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
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Username</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">First Name</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Name</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comment</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.username}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.first_name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.last_name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.email}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.phone}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.comment}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
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

            {selectedStudent && (
                <EditModal
                    user={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    onSubmit={handleUpdate}
                />
            )}
        </div>
    );
};

export default Students; 