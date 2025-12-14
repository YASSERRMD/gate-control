import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, Environment } from '../lib/api';

export default function Validator() {
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [selectedEnv, setSelectedEnv] = useState('');
    const [validation, setValidation] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiGet<Environment[]>('/environments')
            .then(envs => {
                setEnvironments(envs);
                if (envs.length > 0) setSelectedEnv(envs[0].id);
            })
            .catch(console.error);
    }, []);

    const validateConfig = async () => {
        if (!selectedEnv) return;

        setLoading(true);
        try {
            const result = await apiGet<any>(`/environments/${selectedEnv}/validate`);
            setValidation(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Configuration Validator" subtitle="Validate Ocelot configurations before deployment">
            <div className="content-section">
                <div className="section-header">
                    <h3><i className="fas fa-check-double"></i> Validate Configuration</h3>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>
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

                <button className="btn btn-primary" onClick={validateConfig} disabled={loading}>
                    <i className="fas fa-check-double"></i>
                    {loading ? 'Validating...' : 'Run Validation'}
                </button>

                {validation && (
                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
                            Validation Results
                        </h4>

                        {validation.isValid ? (
                            <div style={{
                                padding: '25px',
                                borderRadius: '12px',
                                background: 'rgba(63, 185, 80, 0.1)',
                                border: '1px solid rgba(63, 185, 80, 0.3)',
                                color: '#3fb950'
                            }}>
                                <i className="fas fa-check-circle" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                                <h3 style={{ marginBottom: '10px' }}>Configuration is Valid!</h3>
                                <p>All routes and services are properly configured and ready for deployment.</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    border: '1px solid rgba(255, 107, 107, 0.3)',
                                    color: '#ff6b6b',
                                    marginBottom: '20px'
                                }}>
                                    <i className="fas fa-exclamation-triangle"></i> Configuration has issues that need to be resolved
                                </div>

                                {validation.errors && validation.errors.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h5 style={{ marginBottom: '15px', color: '#ff6b6b' }}>Errors:</h5>
                                        {validation.errors.map((error: string, idx: number) => (
                                            <div key={idx} style={{
                                                padding: '15px',
                                                marginBottom: '10px',
                                                borderRadius: '8px',
                                                background: 'rgba(255, 107, 107, 0.05)',
                                                borderLeft: '3px solid #ff6b6b'
                                            }}>
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {validation.warnings && validation.warnings.length > 0 && (
                                    <div>
                                        <h5 style={{ marginBottom: '15px', color: '#f093fb' }}>Warnings:</h5>
                                        {validation.warnings.map((warning: string, idx: number) => (
                                            <div key={idx} style={{
                                                padding: '15px',
                                                marginBottom: '10px',
                                                borderRadius: '8px',
                                                background: 'rgba(240, 147, 251, 0.05)',
                                                borderLeft: '3px solid #f093fb'
                                            }}>
                                                {warning}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
