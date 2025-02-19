import { useState } from 'react';
import EditModal from './editModal';
import api from '../api/api';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

const UserItem = ({ user, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = () => {
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                setIsLoading(true);
                await api.delete(`/users/${user.clerk_id}`);
                onDelete(user.clerk_id);
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdate = async (updatedUserData) => {
        try {
            setIsLoading(true);
            const response = await api.put(`/users/${user.clerk_id}`, updatedUserData);
            onUpdate(response.data);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <Link to={`/users/${user.clerk_id}`} className="text-blue-600 hover:text-blue-900">
                    {user.first_name}
                </Link>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{user.last_name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.comment}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                    onClick={handleEdit}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    disabled={isLoading}
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-900"
                    disabled={isLoading}
                >
                    Delete
                </button>
            </td>
            {isModalOpen && (
                <EditModal
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleUpdate}
                    isLoading={isLoading}
                />
            )}
        </tr>
    );
};

UserItem.propTypes = {
    user: PropTypes.shape({
        clerk_id: PropTypes.string.isRequired,
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired,
        comment: PropTypes.string
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default UserItem;
