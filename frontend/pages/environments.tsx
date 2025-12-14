import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  discoveryProviderType: string;
}

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [form, setForm] = useState({ name: '', baseUrl: '', discoveryProviderType: 'static' });
  const [loading, setLoading] = useState(false);

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

  return (
    <Layout title="Environments Management" subtitle="Define gateways for Dev, UAT, Prod, and more">
      <div className="grid">
        <div className="card">
          <h3>Create environment</h3>
          <form onSubmit={submit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Base URL
              <input
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://api.example.com"
                required
              />
            </label>
            <label>
              Discovery Provider
              <select
                value={form.discoveryProviderType}
                onChange={(e) => setForm({ ...form, discoveryProviderType: e.target.value })}
              >
                <option value="static">Static</option>
                <option value="consul">Consul</option>
                <option value="eureka">Eureka</option>
              </select>
            </label>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save environment'}</button>
          </form>
        </div>
        <div className="card">
          <h3>Existing environments</h3>
          <ul>
            {environments.map((env) => (
              <li key={env.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{env.name}</strong> — {env.baseUrl} ({env.discoveryProviderType})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
