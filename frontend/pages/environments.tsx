import { FormEvent, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  discoveryProviderType: string;
}

interface ImportResult {
  environmentCreated: boolean;
  environmentId: string;
  routesImported: number;
  servicesCreated: number;
  errors: string[];
  success: boolean;
}

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [form, setForm] = useState({ name: '', baseUrl: '', discoveryProviderType: 'static' });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'import'>('create');

  // Import state
  const [jsonText, setJsonText] = useState('');
  const [envName, setEnvName] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<Environment[]>('/environments').then(setEnvironments).catch(console.error);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await apiPost<Environment>('/environments', form);
      setEnvironments((prev) => [...prev, created]);
      setForm({ name: '', baseUrl: '', discoveryProviderType: 'static' });
    } catch (err) {
      console.error(err);
      alert('Failed to create environment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result as string);
      setImportError('');
    };
    reader.readAsText(file);
  };

  const handleImport = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImportError('');
    setImportResult(null);

    try {
      const config = JSON.parse(jsonText);
      const result = await apiPost<ImportResult>('/import/ocelot', {
        config,
        environmentName: envName || 'Imported'
      });
      setImportResult(result);
      if (result.success) {
        // Refresh environments list
        const envs = await apiGet<Environment[]>('/environments');
        setEnvironments(envs);
        setJsonText('');
        setEnvName('');
      }
    } catch (err: any) {
      setImportError(err?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Environments Management" subtitle="Define gateways for Dev, UAT, Prod, and more">
      <div className="grid">
        <div className="card">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              className={mode === 'create' ? 'btn-primary' : 'btn'}
              onClick={() => setMode('create')}
            >
              <i className="fas fa-plus"></i> Create New
            </button>
            <button
              type="button"
              className={mode === 'import' ? 'btn-primary' : 'btn'}
              onClick={() => setMode('import')}
            >
              <i className="fas fa-file-import"></i> Import Ocelot Config
            </button>
          </div>

          {mode === 'create' ? (
            <>
              <h3>Create Environment</h3>
              <form onSubmit={submit}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Base URL</label>
                  <input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="https://api.example.com" required />
                </div>
                <div className="form-group">
                  <label>Discovery Provider</label>
                  <select
                    value={form.discoveryProviderType}
                    onChange={(e) => setForm({ ...form, discoveryProviderType: e.target.value })}
                  >
                    <option value="Static">Static</option>
                    <option value="Consul">Consul</option>
                    <option value="Eureka">Eureka</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Environment'}</button>
              </form>
            </>
          ) : (
            <>
              <h3>Import from Ocelot Config</h3>
              <form onSubmit={handleImport}>
                <div className="form-group">
                  <label>Environment Name</label>
                  <input
                    value={envName}
                    onChange={(e) => setEnvName(e.target.value)}
                    placeholder="e.g. Production, Staging"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Upload ocelot.json</label>
                  <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileUpload} />
                </div>
                <div className="form-group">
                  <label>Or paste JSON</label>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{"Routes":[...],"GlobalConfiguration":{...}}'
                    rows={8}
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading || !jsonText.trim()}>
                  {loading ? 'Importing...' : 'Import Configuration'}
                </button>
              </form>

              {importError && (
                <div style={{ marginTop: '15px', color: '#ff6b6b' }}>
                  <strong>Error:</strong> {importError}
                </div>
              )}

              {importResult?.success && (
                <div style={{ marginTop: '15px', color: '#51cf66' }}>
                  <i className="fas fa-check"></i> Imported {importResult.routesImported} routes, {importResult.servicesCreated} services!
                  <br />
                  <Link href="/routes" style={{ color: '#74c0fc' }}>View routes →</Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card">
          <h3>Existing Environments</h3>
          {environments.length === 0 ? (
            <p>No environments yet. Create one or import from Ocelot config.</p>
          ) : (
            <ul>
              {environments.map((env) => (
                <li key={env.id} style={{ marginBottom: '0.5rem' }}>
                  <strong>{env.name}</strong> — {env.baseUrl} ({env.discoveryProviderType || 'Static'})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
