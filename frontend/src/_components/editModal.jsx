import { useState } from 'react';
import PropTypes from 'prop-types';

const EditModal = ({ user, onClose, onSubmit, isLoading }) => {
    EditModal.propTypes = {
        user: PropTypes.shape({
            clerk_id: PropTypes.string.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            phone: PropTypes.string.isRequired,
            comment: PropTypes.string
        }).isRequired,
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        isLoading: PropTypes.bool
    };
    const [formData, setFormData] = useState({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        comment: user.comment || '',
        clerk_id: user.clerk_id
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
        
        // Фильтруем только измененные поля
        const changedFields = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] !== user[key]) {
                changedFields[key] = formData[key];
            }
        });

        // Проверяем, есть ли изменения
        if (Object.keys(changedFields).length === 0) {
            onClose();
            return;
        }
        
        await onSubmit(changedFields);
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Edit Student</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Comment
                        </label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            rows={3}
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditModal.defaultProps = {
    isLoading: false
};

export default EditModal;
