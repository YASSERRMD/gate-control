import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    lastLogin: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        apiGet<User[]>('/users').then(setUsers).catch(console.error);
    }, []);

    return (
        <Layout title="User Management" subtitle="Manage system users and access">
            <div className="grid">
                <div className="card">
                    <h3>Users</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td><strong>{user.username}</strong></td>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td><span className="badge">{user.role}</span></td>
                                    <td>
                                        <span className={`status-badge ${user.status === 'active' ? 'success' : 'inactive'}`}>
                                            {user.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{new Date(user.lastLogin).toLocaleString()}</td>
                                    <td>
                                        <button className="btn-sm">Edit</button>
                                        <button className="btn-sm btn-danger">Deactivate</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>User Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{users.length}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-value">{users.filter(u => u.status === 'active').length}</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                    </div>
                    <button className="btn-primary">+ Add New User</button>
                </div>
            </div>
        </Layout>
    );
}
