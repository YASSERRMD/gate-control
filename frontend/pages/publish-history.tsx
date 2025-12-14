import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, PublishHistory, Environment } from '../lib/api';

export default function PublishHistoryPage() {
    const [history, setHistory] = useState<PublishHistory[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);

    useEffect(() => {
        Promise.all([
            apiGet<Environment[]>('/environments')
        ])
            .then(([envs]) => {
                setEnvironments(envs);
                // Load history for all environments
                Promise.all(
                    envs.map(env => apiGet<PublishHistory[]>(`/environments/${env.id}/publish-history`))
                ).then(results => {
                    setHistory(results.flat());
                });
            })
            .catch(console.error);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getEnvironmentName = (envId: string) => {
        return environments.find(e => e.id === envId)?.name || envId;
    };

    return (
        <Layout title="Publish History" subtitle="View deployment history and configuration changes">
            <div className="content-section">
                <div className="section-header">
                    <h3><i className="fas fa-history"></i> Deployment History</h3>
                    <button className="btn btn-secondary">
                        <i className="fas fa-filter"></i> Filter
                    </button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Published At</th>
                            <th>Environment</th>
                            <th>Change Request</th>
                            <th>Published By</th>
                            <th>Target Nodes</th>
                            <th>Config Version</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.id}>
                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{formatDate(item.publishedAt)}</td>
                                <td style={{ fontWeight: 600 }}>{getEnvironmentName(item.environmentId)}</td>
                                <td style={{ color: '#58a6ff', fontWeight: 600 }}>{item.changeRequestId}</td>
                                <td>{item.publishedBy}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {item.targetNodes.map(node => (
                                            <span key={node} className="status-badge" style={{ fontSize: '10px', padding: '3px 8px' }}>
                                                {node}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#58a6ff' }}>{item.configVersion}</td>
                                <td><span className={`status-badge ${item.status}`}>{item.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Timeline View */}
            <div className="content-section">
                <div className="section-header">
                    <h3><i className="fas fa-clock"></i> Recent Deployments</h3>
                </div>
                <div className="timeline">
                    {history.slice(0, 5).map(item => (
                        <div key={item.id} className="timeline-item">
                            <div className="timeline-content">
                                <h4>Deployed to {getEnvironmentName(item.environmentId)}</h4>
                                <p>Change Request {item.changeRequestId} deployed to {item.targetNodes.length} gateway nodes</p>
                                <span className="time">
                                    <i className="fas fa-user"></i> {item.publishedBy} • {formatDate(item.publishedAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
