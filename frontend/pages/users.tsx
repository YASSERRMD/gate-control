import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

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
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        username: '',
        email: '',
        fullName: '',
        role: 'viewer',
        password: ''
    });

    useEffect(() => {
        apiGet<User[]>('/users').then(setUsers).catch(console.error);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                status: 'active',
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            const created = await apiPost<User>('/users', payload);
            setUsers(prev => [...prev, created]);
            setForm({ username: '', email: '', fullName: '', role: 'viewer', password: '' });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create user');
        }
    };

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
                    <h3>{showForm ? 'Add New User' : 'User Statistics'}</h3>
                    {showForm ? (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label>Username</label>
                                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. johndoe" required />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. John Doe" required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="e.g. john@example.com" required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="viewer">Viewer</option>
                                    <option value="developer">Developer</option>
                                    <option value="approver">Approver</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
                            </div>
                            <button type="submit" className="btn-primary">Create User</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
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
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New User</button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
