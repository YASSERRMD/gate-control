import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface Environment { id: string; name: string; }
interface ServiceHost { host: string; port: number; }
interface Service {
  id: string;
  environmentId: string;
  name: string;
  defaultScheme: string;
  hosts: ServiceHost[];
  tags: string[];
  healthEndpoint?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [form, setForm] = useState({
    environmentId: '',
    name: '',
    defaultScheme: 'https',
    host: '',
    port: 443,
    tags: ''
  });

  useEffect(() => {
    apiGet<Service[]>('/services').then(setServices).catch(console.error);
    apiGet<Environment[]>('/environments').then((envs) => {
      setEnvironments(envs);
      if (envs.length && !form.environmentId) {
        setForm((prev) => ({ ...prev, environmentId: envs[0].id }));
      }
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      environmentId: form.environmentId,
      name: form.name,
      defaultScheme: form.defaultScheme,
      hosts: [{ host: form.host, port: Number(form.port) }],
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    };
    try {
      const created = await apiPost<Service>('/services', payload);
      setServices((prev) => [...prev, created]);
      setForm({ ...form, name: '', host: '', tags: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create service');
    }
  };

  return (
    <Layout title="Services Management" subtitle="Register downstream services to reuse across routes">
      <div className="grid">
        <div className="card">
          <h3>New service</h3>
          <form onSubmit={submit}>
            <label>
              Environment
              <select
                value={form.environmentId}
                onChange={(e) => setForm({ ...form, environmentId: e.target.value })}
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
            </label>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Default Scheme
              <select value={form.defaultScheme} onChange={(e) => setForm({ ...form, defaultScheme: e.target.value })}>
                <option value="https">https</option>
                <option value="http">http</option>
              </select>
            </label>
            <label>
              Host
              <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="service.local" required />
            </label>
            <label>
              Port
              <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
            </label>
            <label>
              Tags (comma separated)
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </label>
            <button type="submit">Save service</button>
          </form>
        </div>
        <div className="card">
          <h3>Catalog</h3>
          <ul>
            {services.map((svc) => (
              <li key={svc.id} style={{ marginBottom: '0.75rem' }}>
                <strong>{svc.name}</strong> ({svc.defaultScheme}) — {svc.hosts[0]?.host}:{svc.hosts[0]?.port}
                <div style={{ color: '#9ca3af' }}>Env: {svc.environmentId} | Tags: {svc.tags.join(', ') || 'none'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
