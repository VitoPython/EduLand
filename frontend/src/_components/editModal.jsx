import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { HiX } from 'react-icons/hi';
import { 
    HiOutlineDocumentText, 
    HiOutlineCurrencyDollar, 
    HiOutlineClock,
    HiOutlineBookOpen
} from 'react-icons/hi';

const EditModal = ({ title, fields, initialData, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const getFieldIcon = (fieldName) => {
        switch (fieldName) {
            case 'title':
                return <HiOutlineBookOpen className="h-5 w-5 text-indigo-500" />;
            case 'description':
                return <HiOutlineDocumentText className="h-5 w-5 text-indigo-500" />;
            case 'duration':
                return <HiOutlineClock className="h-5 w-5 text-indigo-500" />;
            case 'price':
                return <HiOutlineCurrencyDollar className="h-5 w-5 text-indigo-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-8 w-full max-w-xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl transform transition-all">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                    >
                        <HiX className="h-6 w-6" />
                    </button>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-8">{title}</h3>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {fields.map((field) => (
                        <div key={field.name} className="relative">
                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                                {field.label}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    {getFieldIcon(field.name)}
                                </div>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        required={field.required}
                                        rows={4}
                                        className="pl-12 block w-full rounded-lg border-gray-300 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-3 transition-all duration-200"
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        required={field.required}
                                        className="pl-12 h-12 block w-full rounded-lg border-gray-300 bg-white/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base transition-all duration-200"
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end space-x-4 mt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl text-base"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditModal.propTypes = {
    title: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        required: PropTypes.bool
    })).isRequired,
    initialData: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default EditModal;
