import { FormEvent, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface Service { id: string; name: string; environmentId: string; }
interface RouteDefinition {
  id: string;
  environmentId: string;
  routeKey: string;
  description?: string;
  upstreamPathTemplate: string;
  upstreamMethods: string[];
  downstreamPathTemplate: string;
  downstreamServiceId: string;
}
interface Environment { id: string; name: string; }

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteDefinition[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [form, setForm] = useState({
    environmentId: '',
    routeKey: '',
    description: '',
    upstreamPathTemplate: '/api/new/{*segments}',
    upstreamMethods: 'GET',
    downstreamPathTemplate: '/new/{segments}',
    downstreamServiceId: '',
    priority: 1
  });

  useEffect(() => {
    apiGet<RouteDefinition[]>('/routes').then(setRoutes);
    apiGet<Service[]>('/services').then((svc) => {
      setServices(svc);
      if (svc.length && !form.downstreamServiceId) {
        setForm((prev) => ({ ...prev, downstreamServiceId: svc[0].id }));
      }
    });
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
      routeKey: form.routeKey,
      description: form.description,
      upstreamPathTemplate: form.upstreamPathTemplate,
      upstreamMethods: form.upstreamMethods.split(',').map((m) => m.trim().toUpperCase()),
      downstreamPathTemplate: form.downstreamPathTemplate,
      downstreamServiceId: form.downstreamServiceId,
      priority: Number(form.priority)
    };
    try {
      const created = await apiPost<RouteDefinition>('/routes', payload);
      setRoutes((prev) => [...prev, created]);
      setForm({ ...form, routeKey: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create route');
    }
  };

  return (
    <Layout title="Routes" description="Build upstream paths mapped to downstream services.">
      <div className="grid">
        <div className="card">
          <h3>New route</h3>
          <form onSubmit={submit}>
            <label>
              Environment
              <select value={form.environmentId} onChange={(e) => setForm({ ...form, environmentId: e.target.value })}>
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
            </label>
            <label>
              Route key
              <input value={form.routeKey} onChange={(e) => setForm({ ...form, routeKey: e.target.value })} required />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label>
              Upstream path template
              <input value={form.upstreamPathTemplate} onChange={(e) => setForm({ ...form, upstreamPathTemplate: e.target.value })} />
            </label>
            <label>
              Upstream methods (comma separated)
              <input value={form.upstreamMethods} onChange={(e) => setForm({ ...form, upstreamMethods: e.target.value })} />
            </label>
            <label>
              Downstream path template
              <input value={form.downstreamPathTemplate} onChange={(e) => setForm({ ...form, downstreamPathTemplate: e.target.value })} />
            </label>
            <label>
              Downstream service
              <select value={form.downstreamServiceId} onChange={(e) => setForm({ ...form, downstreamServiceId: e.target.value })}>
                {services.map((svc) => (
                  <option key={svc.id} value={svc.id}>{svc.name}</option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
            </label>
            <button type="submit">Save route</button>
          </form>
        </div>
        <div className="card">
          <h3>Existing routes</h3>
          <ul>
            {routes.map((route) => (
              <li key={route.id} style={{ marginBottom: '0.75rem' }}>
                <strong>{route.routeKey}</strong> — {route.upstreamPathTemplate} → {route.downstreamPathTemplate}
                <div style={{ color: '#9ca3af' }}>Methods: {route.upstreamMethods.join(', ')} | Env: {route.environmentId}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
