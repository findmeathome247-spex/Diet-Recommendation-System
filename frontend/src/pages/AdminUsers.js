import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-users">
            <h1>👥 Manage Users</h1>

            <div className="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.UserID}>
                                <td>{user.Username}</td>
                                <td>{user.Email}</td>
                                <td>{user.FirstName} {user.LastName}</td>
                                <td>{user.Age}</td>
                                <td>{user.Gender}</td>
                                <td>{new Date(user.CreatedAt).toLocaleDateString()}</td>
                                <td>
                                    <span className={user.IsActive ? 'status active' : 'status inactive'}>
                                        {user.IsActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
