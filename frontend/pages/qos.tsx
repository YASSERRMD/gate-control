import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface QoSPolicy {
    id: string;
    name: string;
    exceptionsAllowedBeforeBreaking: number;
    durationOfBreakSeconds: number;
    timeoutSeconds: number;
    enabled: boolean;
}

export default function QoSPage() {
    const [policies, setPolicies] = useState<QoSPolicy[]>([]);

    useEffect(() => {
        apiGet<QoSPolicy[]>('/qosPolicies').then(setPolicies).catch(console.error);
    }, []);

    return (
        <Layout title="QoS & Circuit Breaker" subtitle="Configure quality of service and circuit breaker policies">
            <div className="grid">
                <div className="card">
                    <h3>QoS Policies</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Exceptions Before Breaking</th>
                                <th>Break Duration</th>
                                <th>Timeout</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((policy) => (
                                <tr key={policy.id}>
                                    <td><strong>{policy.name}</strong></td>
                                    <td>{policy.exceptionsAllowedBeforeBreaking}</td>
                                    <td>{policy.durationOfBreakSeconds}s</td>
                                    <td>{policy.timeoutSeconds}s</td>
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
                    <h3>Circuit Breaker Status</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">Closed</div>
                            <div className="stat-label">Current State</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">12</div>
                            <div className="stat-label">Trips (24h)</div>
                        </div>
                    </div>
                    <button className="btn-primary">+ Add New Policy</button>
                </div>
            </div>
        </Layout>
    );
}
