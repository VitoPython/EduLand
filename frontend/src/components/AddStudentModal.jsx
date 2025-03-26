import { useState, useEffect } from 'react';
import { useGroupStore } from '../stores/groupStore';
import { useStudentStore } from '../stores/studentStore';
import { HiUserAdd, HiX, HiSearch, HiMail, HiAcademicCap, HiStatusOnline } from 'react-icons/hi';
import PropTypes from 'prop-types';

const AddStudentModal = ({ groupId, onClose, onSuccess }) => {
    const { addStudentToGroup } = useGroupStore();
    const { students, fetchStudents } = useStudentStore();
    const [selectedStudent, setSelectedStudent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setIsLoading(true);
        try {
            const student = students.find(s => s.id === selectedStudent);
            if (!student) {
                console.error('Selected student not found');
                return;
            }

            const studentId = student._id || student.id;
            console.log('Adding student with data:', {
                student_id: studentId,
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email
            });

            await addStudentToGroup(groupId, {
                student_id: studentId,
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email,
                balance: 0,
                progress: {},
                total_points: 0,
                status: "Admitted"
            });
            
            if (onSuccess) {
                await onSuccess();
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Error adding student:', error);
            alert(error.response?.data?.detail || 'Failed to add student to group');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Анимированный backdrop с размытием */}
            <div 
                className="fixed inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            ></div>

            {/* Модальное окно */}
            <div className="flex min-h-screen items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>
                    {/* Градиентный заголовок */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-white/20 p-2">
                                    <HiUserAdd className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Add Student to Group</h3>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full p-2 text-white hover:bg-white/20 transition-colors duration-200"
                            >
                                <HiX className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Поисковая строка */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiSearch className="h-5 w-5 text-indigo-500" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-200"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Список студентов */}
                        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 rounded-xl">
                            {filteredStudents.map((student) => (
                                <label
                                    key={student.id}
                                    className={`block relative rounded-xl cursor-pointer transition-all duration-200 ${
                                        selectedStudent === student.id
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md'
                                            : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center p-4">
                                        <input
                                            type="radio"
                                            name="student"
                                            value={student.id}
                                            checked={selectedStudent === student.id}
                                            onChange={(e) => setSelectedStudent(e.target.value)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <HiAcademicCap className="h-5 w-5 text-indigo-500" />
                                                    <span className="font-medium text-gray-900">
                                                        {student.first_name} {student.last_name}
                                                    </span>
                                                </div>
                                                <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                                                    <HiStatusOnline className="h-3 w-3 mr-1" />
                                                    Active
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                                <HiMail className="h-4 w-4 mr-1" />
                                                {student.email}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedStudent || isLoading}
                                className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                    !selectedStudent || isLoading
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding...
                                    </div>
                                ) : (
                                    'Add Student'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

AddStudentModal.propTypes = {
    groupId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func
};

export default AddStudentModal; 