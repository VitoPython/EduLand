import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:8000/users/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    console.error("Failed to fetch user:", await response.text());
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchUser();
    }, [id]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">User Details</h2>
            <p className='text-left'><strong>First Name:</strong> {user.first_name}</p>
            <p className='text-left'><strong>Last Name:</strong> {user.last_name}</p>
            <p className='text-left'><strong>Email:</strong> {user.email}</p>
            <p className='text-left'><strong>Phone:</strong> {user.phone}</p>
            <p className='text-left'><strong>Comment:</strong> {user.comment}</p>
            <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400"
            >
                Back
            </button>
        </div>
    );
};

export default UserDetail;
