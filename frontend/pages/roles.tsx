import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface Role {
    id: string;
    name: string;
    displayName: string;
    permissions: string[];
    description: string;
}

const ALL_PERMISSIONS = ['read', 'write', 'approve', 'publish', 'delete', 'manage_users'];

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        displayName: '',
        description: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        apiGet<Role[]>('/roles').then(setRoles).catch(console.error);
    }, []);

    const togglePermission = (perm: string) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const created = await apiPost<Role>('/roles', form);
            setRoles(prev => [...prev, created]);
            setForm({ name: '', displayName: '', description: '', permissions: [] });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create role');
        }
    };

    return (
        <Layout title="Roles & Permissions" subtitle="Manage user roles and access control">
            <div className="grid">
                <div className="card">
                    <h3>Roles</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Display Name</th>
                                <th>Permissions</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td><code>{role.name}</code></td>
                                    <td><strong>{role.displayName}</strong></td>
                                    <td>
                                        {role.permissions.map(p => (
                                            <span key={p} className="badge" style={{ marginRight: '4px' }}>{p}</span>
                                        ))}
                                    </td>
                                    <td>{role.description}</td>
                                    <td>
                                        <button className="btn-sm">Edit</button>
                                        <button className="btn-sm btn-danger">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>{showForm ? 'Add New Role' : 'Permission Types'}</h3>
                    {showForm ? (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label>Role Name (code)</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. super_admin" required />
                            </div>
                            <div className="form-group">
                                <label>Display Name</label>
                                <input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} placeholder="e.g. Super Administrator" required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Role description..." rows={2} />
                            </div>
                            <div className="form-group">
                                <label>Permissions</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                    {ALL_PERMISSIONS.map(perm => (
                                        <label key={perm} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={form.permissions.includes(perm)}
                                                onChange={() => togglePermission(perm)}
                                                style={{ marginRight: '6px' }}
                                            />
                                            {perm}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary">Create Role</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
                            <ul>
                                <li><strong>read</strong> - View configurations and data</li>
                                <li><strong>write</strong> - Create and edit configurations</li>
                                <li><strong>approve</strong> - Approve change requests</li>
                                <li><strong>publish</strong> - Publish configurations to gateway</li>
                                <li><strong>delete</strong> - Delete configurations</li>
                                <li><strong>manage_users</strong> - Manage users and roles</li>
                            </ul>
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Role</button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
