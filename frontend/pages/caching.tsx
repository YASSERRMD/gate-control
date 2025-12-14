import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface CachingPolicy {
    id: string;
    name: string;
    ttlSeconds: number;
    region: string;
    varyByQueryString: boolean;
    varyByHeader: string[];
    enabled: boolean;
}

export default function CachingPage() {
    const [policies, setPolicies] = useState<CachingPolicy[]>([]);

    useEffect(() => {
        apiGet<CachingPolicy[]>('/cachingPolicies').then(setPolicies).catch(console.error);
    }, []);

    return (
        <Layout title="Caching Policies" subtitle="Configure response caching to improve performance">
            <div className="grid">
                <div className="card">
                    <h3>Caching Policies</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>TTL</th>
                                <th>Region</th>
                                <th>Vary By Query</th>
                                <th>Vary By Headers</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((policy) => (
                                <tr key={policy.id}>
                                    <td><strong>{policy.name}</strong></td>
                                    <td>{policy.ttlSeconds}s</td>
                                    <td><span className="badge">{policy.region}</span></td>
                                    <td>{policy.varyByQueryString ? '✓ Yes' : '✗ No'}</td>
                                    <td>{policy.varyByHeader?.join(', ') || 'None'}</td>
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
                    <h3>Cache Performance</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">85.2%</div>
                            <div className="stat-label">Cache Hit Rate</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">14.8%</div>
                            <div className="stat-label">Cache Miss Rate</div>
                        </div>
                    </div>
                    <button className="btn-primary">+ Add New Policy</button>
                    <button className="btn">Clear All Caches</button>
                </div>
            </div>
        </Layout>
    );
}
