import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, AuditLog } from '../lib/api';

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        apiGet<AuditLog[]>('/audit-logs')
            .then(setLogs)
            .catch(console.error);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getActionIcon = (action: string) => {
        const icons: Record<string, string> = {
            'publish_config': 'fa-rocket',
            'approve_change_request': 'fa-check-circle',
            'create_change_request': 'fa-plus-circle',
            'update_route': 'fa-edit',
            'delete_route': 'fa-trash',
            'create_service': 'fa-server'
        };
        return icons[action] || 'fa-file-alt';
    };

    return (
        <Layout title="Audit Logs" subtitle="Track all system activities and changes">
            <div className="content-section">
                <div className="section-header">
                    <h3><i className="fas fa-file-alt"></i> Audit Trail</h3>
                    <button className="btn btn-secondary">
                        <i className="fas fa-download"></i> Export Logs
                    </button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Details</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{formatDate(log.timestamp)}</td>
                                <td style={{ fontWeight: 600 }}>{log.actor}</td>
                                <td>
                                    <span className="status-badge active">
                                        <i className={`fas ${getActionIcon(log.action)}`}></i> {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td style={{ color: '#58a6ff', fontWeight: 600 }}>{log.resource}</td>
                                <td>{log.details}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.ipAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
