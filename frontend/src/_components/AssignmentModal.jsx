import { useState } from 'react';
import PropTypes from 'prop-types';
import AssignmentEditor from './AssignmentEditor';

const AssignmentModal = ({ assignment, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: assignment?.title || '',
        description: assignment?.description || '',
        code_editor: assignment?.code_editor || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDescriptionChange = (html) => {
        setFormData(prev => ({
            ...prev,
            description: html
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-8 border w-[95%] max-w-4xl shadow-2xl rounded-2xl bg-white">
                {/* Заголовок */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {assignment ? 'Edit Assignment' : 'Create Assignment'}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {assignment ? 'Update the assignment details below' : 'Fill in the assignment details below'}
                    </p>
                </div>

                {/* Форма */}
                <div className="space-y-8">
                    {/* Title поле */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                            placeholder="Enter assignment title..."
                        />
                    </div>

                    {/* Description поле */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                            Description
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <AssignmentEditor
                                content={formData.description}
                                onChange={handleDescriptionChange}
                            />
                        </div>
                    </div>

                    {/* Initial Code поле */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Initial Code
                        </label>
                        <div className="relative">
                            <textarea
                                name="code_editor"
                                value={formData.code_editor}
                                onChange={handleChange}
                                rows={8}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 font-mono bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                                placeholder="# Write your initial code here..."
                            />
                        </div>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {assignment ? 'Save Changes' : 'Create Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

AssignmentModal.propTypes = {
    assignment: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        code_editor: PropTypes.string
    }),
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default AssignmentModal; 