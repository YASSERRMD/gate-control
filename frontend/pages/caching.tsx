import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

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
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        ttlSeconds: 300,
        region: 'default',
        varyByQueryString: true,
        varyByHeader: ''
    });

    useEffect(() => {
        apiGet<CachingPolicy[]>('/cachingPolicies').then(setPolicies).catch(console.error);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                varyByHeader: form.varyByHeader.split(',').map(s => s.trim()).filter(Boolean),
                enabled: true
            };
            const created = await apiPost<CachingPolicy>('/cachingPolicies', payload);
            setPolicies(prev => [...prev, created]);
            setForm({ name: '', ttlSeconds: 300, region: 'default', varyByQueryString: true, varyByHeader: '' });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create policy');
        }
    };

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
                    <h3>{showForm ? 'Add New Policy' : 'Cache Performance'}</h3>
                    {showForm ? (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label>Policy Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. API Response Cache" required />
                            </div>
                            <div className="form-group">
                                <label>TTL (seconds)</label>
                                <input type="number" value={form.ttlSeconds} onChange={e => setForm({ ...form, ttlSeconds: parseInt(e.target.value) || 0 })} min="1" required />
                            </div>
                            <div className="form-group">
                                <label>Cache Region</label>
                                <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                                    <option value="default">Default</option>
                                    <option value="us-east">US East</option>
                                    <option value="us-west">US West</option>
                                    <option value="eu-central">EU Central</option>
                                    <option value="ap-southeast">AP Southeast</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" checked={form.varyByQueryString} onChange={e => setForm({ ...form, varyByQueryString: e.target.checked })} style={{ marginRight: '8px' }} />
                                    Vary By Query String
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Vary By Headers (comma-separated)</label>
                                <input value={form.varyByHeader} onChange={e => setForm({ ...form, varyByHeader: e.target.value })} placeholder="Accept, Accept-Encoding" />
                            </div>
                            <button type="submit" className="btn-primary">Save Policy</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
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
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Policy</button>
                            <button className="btn">Clear All Caches</button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
