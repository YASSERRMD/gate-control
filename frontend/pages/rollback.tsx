import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface PublishRecord {
    id: string;
    environmentId: string;
    changeRequestId: string;
    publishedBy: string;
    publishedAt: string;
    targetNodes: string[];
    status: string;
    configVersion: string;
}

export default function RollbackPage() {
    const [history, setHistory] = useState<PublishRecord[]>([]);
    const [selectedVersion, setSelectedVersion] = useState('');

    useEffect(() => {
        apiGet<PublishRecord[]>('/publishHistory').then(setHistory).catch(console.error);
    }, []);

    const executeRollback = () => {
        if (!selectedVersion) {
            alert('Please select a version to rollback to');
            return;
        }
        if (confirm(`Are you sure you want to rollback to ${selectedVersion}?`)) {
            alert(`Rollback to ${selectedVersion} initiated`);
        }
    };

    return (
        <Layout title="Rollback" subtitle="Rollback to previous gateway configurations">
            <div className="grid">
                <div className="card">
                    <h3>Deployment History</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Version</th>
                                <th>Environment</th>
                                <th>Published By</th>
                                <th>Published At</th>
                                <th>Target Nodes</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record.id}>
                                    <td><code>{record.configVersion}</code></td>
                                    <td><span className="badge">{record.environmentId}</span></td>
                                    <td>{record.publishedBy}</td>
                                    <td>{new Date(record.publishedAt).toLocaleString()}</td>
                                    <td>{record.targetNodes.length} nodes</td>
                                    <td>
                                        <span className={`status-badge ${record.status === 'success' ? 'success' : 'error'}`}>
                                            {record.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-sm"
                                            onClick={() => setSelectedVersion(record.configVersion)}
                                        >
                                            Select
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>Rollback Configuration</h3>
                    {selectedVersion ? (
                        <div>
                            <p><strong>Selected Version:</strong> <code>{selectedVersion}</code></p>
                            <p className="warning">⚠️ Rolling back will replace the current configuration with the selected version.</p>
                            <button className="btn-danger" onClick={executeRollback}>Execute Rollback</button>
                            <button className="btn" onClick={() => setSelectedVersion('')}>Cancel</button>
                        </div>
                    ) : (
                        <p>Select a version from the history to rollback</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
