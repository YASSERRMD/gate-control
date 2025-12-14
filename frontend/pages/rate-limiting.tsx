import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

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
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        period: '1m',
        limit: 100,
        clientIdHeader: 'X-Client-Id'
    });

    useEffect(() => {
        apiGet<RateLimitPolicy[]>('/rateLimitPolicies').then(setPolicies).catch(console.error);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form, enabled: true, appliedRoutes: [] };
            const created = await apiPost<RateLimitPolicy>('/rateLimitPolicies', payload);
            setPolicies(prev => [...prev, created]);
            setForm({ name: '', period: '1m', limit: 100, clientIdHeader: 'X-Client-Id' });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create policy');
        }
    };

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
                                    <td>{policy.appliedRoutes?.length || 0} routes</td>
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
                    <h3>{showForm ? 'Add New Policy' : 'Rate Limit Statistics'}</h3>
                    {showForm ? (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label>Policy Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. API Rate Limit" required />
                            </div>
                            <div className="form-group">
                                <label>Period</label>
                                <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                                    <option value="1s">1 Second</option>
                                    <option value="5s">5 Seconds</option>
                                    <option value="1m">1 Minute</option>
                                    <option value="5m">5 Minutes</option>
                                    <option value="1h">1 Hour</option>
                                    <option value="1d">1 Day</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Request Limit</label>
                                <input type="number" value={form.limit} onChange={e => setForm({ ...form, limit: parseInt(e.target.value) || 0 })} min="1" required />
                            </div>
                            <div className="form-group">
                                <label>Client ID Header</label>
                                <input value={form.clientIdHeader} onChange={e => setForm({ ...form, clientIdHeader: e.target.value })} placeholder="X-Client-Id" required />
                            </div>
                            <button type="submit" className="btn-primary">Save Policy</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
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
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Policy</button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
