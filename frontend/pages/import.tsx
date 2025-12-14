import { FormEvent, useState, useRef } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiPost } from '../lib/api';

interface ImportResult {
    environmentCreated: boolean;
    environmentId: string;
    routesImported: number;
    servicesCreated: number;
    errors: string[];
    success: boolean;
}

export default function ImportPage() {
    const [jsonText, setJsonText] = useState('');
    const [envName, setEnvName] = useState('Imported');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonText(content);
            setError('');
        };
        reader.onerror = () => setError('Failed to read file');
        reader.readAsText(file);
    };

    const handleImport = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const config = JSON.parse(jsonText);
            const response = await apiPost<ImportResult>('/import/ocelot', {
                config,
                environmentName: envName
            });
            setResult(response);
        } catch (err: any) {
            if (err?.message?.includes('JSON')) {
                setError('Invalid JSON format. Please check your configuration.');
            } else {
                setError(err?.message || 'Import failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const sampleConfig = `{
  "Routes": [
    {
      "UpstreamPathTemplate": "/api/orders/{everything}",
      "UpstreamHttpMethod": ["GET", "POST"],
      "DownstreamPathTemplate": "/api/orders/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        { "Host": "orders-service", "Port": 443 }
      ]
    }
  ],
  "GlobalConfiguration": {
    "BaseUrl": "https://api.example.com"
  }
}`;

    return (
        <Layout title="Import Configuration" subtitle="Import existing Ocelot gateway configurations">
            <div className="grid">
                <div className="card">
                    <h3><i className="fas fa-file-import"></i> Import Ocelot Config</h3>
                    <form onSubmit={handleImport}>
                        <div className="form-group">
                            <label>Environment Name</label>
                            <input
                                value={envName}
                                onChange={e => setEnvName(e.target.value)}
                                placeholder="e.g. Production, Staging"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Upload ocelot.json file</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".json"
                                onChange={handleFileUpload}
                                style={{ padding: '10px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Or paste JSON configuration</label>
                            <textarea
                                value={jsonText}
                                onChange={e => setJsonText(e.target.value)}
                                placeholder="Paste your ocelot.json content here..."
                                rows={15}
                                style={{ fontFamily: 'monospace', fontSize: '13px' }}
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading || !jsonText.trim()}>
                            {loading ? 'Importing...' : 'Import Configuration'}
                        </button>

                        <button
                            type="button"
                            className="btn"
                            onClick={() => setJsonText(sampleConfig)}
                            style={{ marginLeft: '10px' }}
                        >
                            Load Sample
                        </button>
                    </form>

                    {error && (
                        <div className="result-section" style={{ marginTop: '20px', color: '#ff6b6b' }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3><i className="fas fa-check-circle"></i> Import Results</h3>
                    {result ? (
                        <div className="result-section">
                            <div className="stats-grid">
                                <div className={`stat-card ${result.success ? 'success' : ''}`}>
                                    <div className="stat-value">{result.routesImported}</div>
                                    <div className="stat-label">Routes Imported</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{result.servicesCreated}</div>
                                    <div className="stat-label">Services Created</div>
                                </div>
                            </div>

                            {result.environmentCreated && (
                                <p style={{ marginTop: '15px' }}>
                                    <strong>Environment Created:</strong> ID {result.environmentId}
                                </p>
                            )}

                            {result.errors.length > 0 && (
                                <div style={{ marginTop: '15px', color: '#ff6b6b' }}>
                                    <strong>Errors:</strong>
                                    <ul>
                                        {result.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.success && (
                                <p style={{ marginTop: '20px', color: '#51cf66' }}>
                                    <i className="fas fa-check"></i> Import completed successfully!
                                    <br />
                                    <Link href="/routes" style={{ color: '#74c0fc' }}>View imported routes →</Link>
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="result-section">
                            <p>No import results yet. Upload or paste your Ocelot configuration and click Import.</p>

                            <h4 style={{ marginTop: '20px' }}>Supported Features</h4>
                            <ul>
                                <li><strong>Routes</strong> - All route configurations</li>
                                <li><strong>DownstreamHostAndPorts</strong> - Auto-creates services</li>
                                <li><strong>AuthenticationOptions</strong> - Auth policies</li>
                                <li><strong>RateLimitOptions</strong> - Rate limiting</li>
                                <li><strong>FileCacheOptions</strong> - Caching settings</li>
                                <li><strong>GlobalConfiguration</strong> - Environment settings</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
