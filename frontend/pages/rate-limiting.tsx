import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface RateLimitPolicy {
    id: string;
    name: string;
    period: string;
    limit: number;
    clientIdHeader: string;
    enabled: boolean;
    appliedRoutes: string[];
}

export default function RateLimitingPage() {
    const [policies, setPolicies] = useState<RateLimitPolicy[]>([]);

    useEffect(() => {
        apiGet<RateLimitPolicy[]>('/rateLimitPolicies').then(setPolicies).catch(console.error);
    }, []);

    return (
        <Layout title="Rate Limiting" subtitle="Configure request rate limits to prevent abuse">
            <div className="grid">
                <div className="card">
                    <h3>Rate Limit Policies</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Period</th>
                                <th>Limit</th>
                                <th>Client ID Header</th>
                                <th>Applied Routes</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((policy) => (
                                <tr key={policy.id}>
                                    <td><strong>{policy.name}</strong></td>
                                    <td><span className="badge">{policy.period}</span></td>
                                    <td>{policy.limit} requests</td>
                                    <td><code>{policy.clientIdHeader}</code></td>
                                    <td>{policy.appliedRoutes.length} routes</td>
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
                    <h3>Rate Limit Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">2,450</div>
                            <div className="stat-label">Requests Throttled (24h)</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">98.5%</div>
                            <div className="stat-label">Requests Within Limits</div>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => alert('Add New Rate Limiting Policy form would open here.')}>+ Add New Policy</button>
                    <button className="btn" onClick={() => alert('Test rate limiting would start here.')}>Test Rate Limits</button>
                </div>
            </div>
        </Layout>
    );
}
