import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface GatewayNode {
    nodeId: string;
    status: string;
    uptime: string;
    requestsPerSecond: number;
    errorRate: number;
    lastHealthCheck: string;
    version: string;
}

export default function GatewayHealthPage() {
    const [nodes, setNodes] = useState<GatewayNode[]>([]);

    useEffect(() => {
        apiGet<GatewayNode[]>('/gatewayHealth').then(setNodes).catch(console.error);
    }, []);

    return (
        <Layout title="Gateway Health" subtitle="Monitor gateway nodes and service health">
            <div className="grid">
                <div className="card">
                    <h3>Gateway Nodes</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Node ID</th>
                                <th>Status</th>
                                <th>Uptime</th>
                                <th>Requests/sec</th>
                                <th>Error Rate</th>
                                <th>Version</th>
                                <th>Last Check</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nodes.map((node) => (
                                <tr key={node.nodeId}>
                                    <td><code>{node.nodeId}</code></td>
                                    <td>
                                        <span className={`status-badge ${node.status === 'healthy' ? 'success' :
                                                node.status === 'degraded' ? 'warning' : 'error'
                                            }`}>
                                            {node.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{node.uptime}</td>
                                    <td>{node.requestsPerSecond}</td>
                                    <td>{(node.errorRate * 100).toFixed(2)}%</td>
                                    <td><span className="badge">{node.version}</span></td>
                                    <td>{new Date(node.lastHealthCheck).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>Overall Health</h3>
                    <div className="stats-grid">
                        <div className="stat-card success">
                            <div className="stat-value">{nodes.filter(n => n.status === 'healthy').length}</div>
                            <div className="stat-label">Healthy Nodes</div>
                        </div>
                        <div className="stat-card warning">
                            <div className="stat-value">{nodes.filter(n => n.status === 'degraded').length}</div>
                            <div className="stat-label">Degraded Nodes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{nodes.reduce((sum, n) => sum + n.requestsPerSecond, 0)}</div>
                            <div className="stat-label">Total Requests/sec</div>
                        </div>
                    </div>
                    <button className="btn">Refresh Health Status</button>
                </div>
            </div>
        </Layout>
    );
}
