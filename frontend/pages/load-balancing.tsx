import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface LoadBalancer {
    id: string;
    name: string;
    type: string;
    serviceId: string;
    enabled: boolean;
}

export default function LoadBalancingPage() {
    const [balancers, setBalancers] = useState<LoadBalancer[]>([]);

    useEffect(() => {
        apiGet<LoadBalancer[]>('/loadBalancers').then(setBalancers).catch(console.error);
    }, []);

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
                    <h3>Load Balancer Types</h3>
                    <ul>
                        <li><strong>Round Robin</strong> - Distributes requests evenly across all instances</li>
                        <li><strong>Least Connection</strong> - Routes to instance with fewest active connections</li>
                        <li><strong>Weighted</strong> - Distributes based on assigned weights</li>
                        <li><strong>IP Hash</strong> - Routes based on client IP address</li>
                    </ul>
                    <button className="btn-primary" onClick={() => alert('Add New Load Balancer form would open here.')}>+ Add New Load Balancer</button>
                    <button className="btn" onClick={() => alert('Test load balancing would start here.')}>Test Load Balancing</button>
                </div>
            </div>
        </Layout>
    );
}
