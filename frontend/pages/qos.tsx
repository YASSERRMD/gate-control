import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

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
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        exceptionsAllowedBeforeBreaking: 5,
        durationOfBreakSeconds: 30,
        timeoutSeconds: 30
    });

    useEffect(() => {
        apiGet<QoSPolicy[]>('/qosPolicies').then(setPolicies).catch(console.error);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form, enabled: true };
            const created = await apiPost<QoSPolicy>('/qosPolicies', payload);
            setPolicies(prev => [...prev, created]);
            setForm({ name: '', exceptionsAllowedBeforeBreaking: 5, durationOfBreakSeconds: 30, timeoutSeconds: 30 });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create policy');
        }
    };

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
                    <h3>{showForm ? 'Add New Policy' : 'Circuit Breaker Status'}</h3>
                    {showForm ? (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label>Policy Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Default QoS Policy" required />
                            </div>
                            <div className="form-group">
                                <label>Exceptions Before Breaking</label>
                                <input type="number" value={form.exceptionsAllowedBeforeBreaking} onChange={e => setForm({ ...form, exceptionsAllowedBeforeBreaking: parseInt(e.target.value) || 0 })} min="1" required />
                            </div>
                            <div className="form-group">
                                <label>Break Duration (seconds)</label>
                                <input type="number" value={form.durationOfBreakSeconds} onChange={e => setForm({ ...form, durationOfBreakSeconds: parseInt(e.target.value) || 0 })} min="1" required />
                            </div>
                            <div className="form-group">
                                <label>Timeout (seconds)</label>
                                <input type="number" value={form.timeoutSeconds} onChange={e => setForm({ ...form, timeoutSeconds: parseInt(e.target.value) || 0 })} min="1" required />
                            </div>
                            <button type="submit" className="btn-primary">Save Policy</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
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
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Policy</button>
                            <button className="btn">Test Circuit Breaker</button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
