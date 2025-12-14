import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface LoadBalancer {
    id: string;
    name: string;
    type: string;
    serviceId: string;
    enabled: boolean;
}

export default function LoadBalancingPage() {
    const [balancers, setBalancers] = useState<LoadBalancer[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        type: 'RoundRobin',
        serviceId: ''
    });

    useEffect(() => {
        apiGet<LoadBalancer[]>('/loadBalancers').then(setBalancers).catch(console.error);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form, enabled: true };
            const created = await apiPost<LoadBalancer>('/loadBalancers', payload);
            setBalancers(prev => [...prev, created]);
            setForm({ name: '', type: 'RoundRobin', serviceId: '' });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create load balancer');
        }
    };

    return (
        <Layout title="Load Balancing" subtitle="Configure load balancing strategies for services">
            <div className="grid">
                <div className="card">
                    <h3>Load Balancers</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {balancers.map((lb) => (
                                <tr key={lb.id}>
                                    <td><strong>{lb.name}</strong></td>
                                    <td><span className="badge">{lb.type}</span></td>
                                    <td><code>{lb.serviceId}</code></td>
                                    <td>
                                        <span className={`status-badge ${lb.enabled ? 'success' : 'inactive'}`}>
                                            {lb.enabled ? 'Enabled' : 'Disabled'}
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
                    <h3>{showForm ? 'Add New Load Balancer' : 'Load Balancer Types'}</h3>
                    {showForm ? (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Orders Service LB" required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="RoundRobin">Round Robin</option>
                                    <option value="LeastConnection">Least Connection</option>
                                    <option value="Weighted">Weighted</option>
                                    <option value="IPHash">IP Hash</option>
                                    <option value="Random">Random</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Service ID</label>
                                <input value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} placeholder="e.g. svc-orders" required />
                            </div>
                            <button type="submit" className="btn-primary">Save Load Balancer</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
                            <ul>
                                <li><strong>Round Robin</strong> - Distributes requests evenly across all instances</li>
                                <li><strong>Least Connection</strong> - Routes to instance with fewest active connections</li>
                                <li><strong>Weighted</strong> - Distributes based on assigned weights</li>
                                <li><strong>IP Hash</strong> - Routes based on client IP address</li>
                            </ul>
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Load Balancer</button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
