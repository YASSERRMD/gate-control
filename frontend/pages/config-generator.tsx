import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, Environment } from '../lib/api';

export default function ConfigGenerator() {
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedEnv, setSelectedEnv] = useState('');
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        apiGet<Environment[]>('/environments')
            .then(envs => {
                setEnvironments(envs);
                if (envs.length > 0) setSelectedEnv(envs[0].id);
            })
            .catch(console.error);
    }, []);

    const generateConfig = async () => {
        if (!selectedEnv) return;

        setLoading(true);
        setError('');
        try {
            const result = await apiGet<any>(`/environments/${selectedEnv}/ocelot`);
            setConfig(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadConfig = () => {
        if (!config) return;

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocelot-${selectedEnv}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Layout title="Ocelot Config Generator" subtitle="Generate Ocelot configuration files for your environments">
            <div className="content-section">
                <div className="section-header">
                    <h3><i className="fas fa-cog"></i> Configuration Generator</h3>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: '#475569' }}>
                        Select Environment
                    </label>
                    <select
                        value={selectedEnv}
                        onChange={(e) => setSelectedEnv(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            fontSize: '14px',
                            fontWeight: 500,
                            background: 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer'
                        }}
                    >
                        {environments.map(env => (
                            <option key={env.id} value={env.id}>{env.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                    <button className="btn btn-primary" onClick={generateConfig} disabled={loading}>
                        <i className="fas fa-cog"></i>
                        {loading ? 'Generating...' : 'Generate Configuration'}
                    </button>
                    {config && (
                        <button className="btn btn-secondary" onClick={downloadConfig}>
                            <i className="fas fa-download"></i>
                            Download JSON
                        </button>
                    )}
                </div>

                {error && (
                    <div style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        color: '#ff6b6b',
                        marginBottom: '20px'
                    }}>
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                {config && (
                    <div>
                        <h4 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 700 }}>
                            Generated Configuration
                        </h4>
                        <pre style={{
                            background: 'rgba(0, 0, 0, 0.05)',
                            padding: '25px',
                            borderRadius: '12px',
                            overflow: 'auto',
                            maxHeight: '600px',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}>
                            {JSON.stringify(config, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="content-section">
                <div className="section-header">
                    <h3><i className="fas fa-info-circle"></i> About Ocelot Configuration</h3>
                </div>
                <p style={{ lineHeight: '1.8', color: '#64748b', marginBottom: '15px' }}>
                    The Ocelot configuration generator creates a complete <code>ocelot.json</code> file based on your
                    environment, services, and routes. This configuration can be directly deployed to your Ocelot API Gateway instances.
                </p>
                <div className="quick-actions">
                    <div className="quick-action-card" onClick={() => window.location.href = '/validator'}>
                        <i className="fas fa-check-double"></i>
                        <h4>Validate Configuration</h4>
                    </div>
                    <div className="quick-action-card" onClick={() => window.location.href = '/routes'}>
                        <i className="fas fa-route"></i>
                        <h4>Manage Routes</h4>
                    </div>
                    <div className="quick-action-card" onClick={() => window.location.href = '/services'}>
                        <i className="fas fa-server"></i>
                        <h4>Manage Services</h4>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
