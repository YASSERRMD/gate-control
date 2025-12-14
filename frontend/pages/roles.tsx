import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface Role {
    id: string;
    name: string;
    displayName: string;
    permissions: string[];
    description: string;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        apiGet<Role[]>('/roles').then(setRoles).catch(console.error);
    }, []);

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
                    <h3>Permission Types</h3>
                    <ul>
                        <li><strong>read</strong> - View configurations and data</li>
                        <li><strong>write</strong> - Create and edit configurations</li>
                        <li><strong>approve</strong> - Approve change requests</li>
                        <li><strong>publish</strong> - Publish configurations to gateway</li>
                        <li><strong>delete</strong> - Delete configurations</li>
                        <li><strong>manage_users</strong> - Manage users and roles</li>
                    </ul>
                    <button className="btn-primary">+ Add New Role</button>
                </div>
            </div>
        </Layout>
    );
}
