import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface AuthPolicy {
    id: string;
    name: string;
    scheme: string;
    provider: string;
    authority: string;
    allowedScopes: string[];
    requireHttps: boolean;
    enabled: boolean;
}

export default function AuthenticationPage() {
    const [policies, setPolicies] = useState<AuthPolicy[]>([]);

    useEffect(() => {
        apiGet<AuthPolicy[]>('/authenticationPolicies').then(setPolicies).catch(console.error);
    }, []);

    return (
        <Layout title="Authentication Policies" subtitle="Configure authentication schemes and identity providers">
            <div className="grid">
                <div className="card">
                    <h3>Authentication Policies</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Scheme</th>
                                <th>Provider</th>
                                <th>Scopes</th>
                                <th>HTTPS Required</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((policy) => (
                                <tr key={policy.id}>
                                    <td><strong>{policy.name}</strong></td>
                                    <td><span className="badge">{policy.scheme.toUpperCase()}</span></td>
                                    <td>{policy.provider}</td>
                                    <td>{policy.allowedScopes.join(', ')}</td>
                                    <td>{policy.requireHttps ? '✓ Yes' : '✗ No'}</td>
                                    <td>
                                        <span className={`status-badge ${policy.enabled ? 'success' : 'inactive'}`}>
                                            {policy.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
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
                    <h3>Quick Actions</h3>
                    <button className="btn-primary">+ Add New Policy</button>
                    <button className="btn">Test Authentication</button>
                    <button className="btn">View Documentation</button>
                </div>
            </div>
        </Layout>
    );
}
