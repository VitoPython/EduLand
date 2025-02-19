import { useEffect, useState } from "react";
import api from '../api/api';
import UserItem from "../_components/useritem";
import { useNavigate } from 'react-router-dom';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                if (error.response?.status === 401) {
                    navigate('/sign-in');
                }
            }
        };

        fetchUsers();
    }, [navigate]);

    const handleUpdate = (updatedUser) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.clerk_id === updatedUser.clerk_id ? updatedUser : user
            )
        );
    };

    const handleDelete = (clerkId) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.clerk_id !== clerkId));
    };

    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <UserItem
                            key={user.clerk_id}
                            user={user}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </tbody>
            </table>
            <div className="mt-6 flex items-center justify-center gap-x-6">
         

          <a className='border rounded-md p-3 shadow-sm hover:shadow-lg hover:bg-gray-100 transition cursor-pointer'
                  onClick={() => {
                    navigate('/')
                  }}
                >
                  Go to Users
                </a>
        </div>
        </>
    );
};

export default UserList;
