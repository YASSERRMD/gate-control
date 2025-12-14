import { useState } from 'react';
import Layout from '../components/Layout';

export default function DiffViewerPage() {
    const [comparison, setComparison] = useState({
        from: 'v2.4.7',
        to: 'v2.4.8'
    });

    const diffs = [
        {
            type: 'modified',
            path: 'routes/route-customers-v1',
            changes: [
                { type: 'removed', line: '  "cache": { "ttlSeconds": 60 }' },
                { type: 'added', line: '  "cache": { "ttlSeconds": 120 }' }
            ]
        },
        {
            type: 'added',
            path: 'routes/route-customers-v2',
            changes: [
                { type: 'added', line: '+ New route added for customer API v2' }
            ]
        }
    ];

    return (
        <Layout title="Diff Viewer" subtitle="Compare configuration versions and environments">
            <div className="grid">
                <div className="card">
                    <h3>Select Versions to Compare</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>From Version</label>
                            <select value={comparison.from} onChange={(e) => setComparison({ ...comparison, from: e.target.value })}>
                                <option>v2.4.7</option>
                                <option>v2.4.6</option>
                                <option>v2.4.5</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>To Version</label>
                            <select value={comparison.to} onChange={(e) => setComparison({ ...comparison, to: e.target.value })}>
                                <option>v2.4.8</option>
                                <option>v2.4.7</option>
                                <option>v2.4.6</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn-primary">Compare</button>
                </div>

                <div className="card">
                    <h3>Configuration Differences</h3>
                    <div className="diff-container">
                        {diffs.map((diff, idx) => (
                            <div key={idx} className="diff-section">
                                <div className="diff-header">
                                    <span className={`badge ${diff.type === 'added' ? 'success' : 'warning'}`}>
                                        {diff.type.toUpperCase()}
                                    </span>
                                    <code>{diff.path}</code>
                                </div>
                                <div className="diff-content">
                                    {diff.changes.map((change, cidx) => (
                                        <div key={cidx} className={`diff-line ${change.type}`}>
                                            {change.line}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn">Export Diff Report</button>
                </div>
            </div>
        </Layout>
    );
}
