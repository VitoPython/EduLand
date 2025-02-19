import { useState } from 'react';
import PropTypes from 'prop-types';

const LessonModal = ({ lesson, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: lesson?.title || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
                    {lesson ? 'Edit Lesson' : 'Create Lesson'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                            {lesson ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

LessonModal.propTypes = {
    lesson: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string.isRequired,
    }),
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default LessonModal; 