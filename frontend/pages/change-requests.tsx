import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost, apiPut } from '../lib/api';

interface ChangeRequestItem {
  entityType: 'Route' | 'Service' | 'Environment' | 'Global';
  entityId: string;
  beforeJson: unknown;
  afterJson: unknown;
}

interface ChangeRequest {
  id: string;
  environmentId: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  createdBy: string;
  items: ChangeRequestItem[];
}

interface Environment { id: string; name: string; }

export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [form, setForm] = useState({ environmentId: '', title: '', description: '' });

  useEffect(() => {
    apiGet<ChangeRequest[]>('/change-requests').then(setRequests);
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
      title: form.title,
      description: form.description,
      items: [] as ChangeRequestItem[]
    };
    try {
      const created = await apiPost<ChangeRequest>('/change-requests', payload);
      setRequests((prev) => [...prev, created]);
      setForm({ ...form, title: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create change request');
    }
  };

  const transition = async (id: string, status: ChangeRequest['status']) => {
    const updated = await apiPut<ChangeRequest>(`/change-requests/${id}/status`, { status, actor: 'demo-user' });
    setRequests((prev) => prev.map((cr) => (cr.id === id ? updated : cr)));
  };

  return (
    <Layout title="Change Requests" subtitle="Draft, approve, and publish gateway changes">
      <div className="grid">
        <div className="card">
          <h3>New change request</h3>
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
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <button type="submit">Save request</button>
          </form>
        </div>
        <div className="card">
          <h3>Workflow</h3>
          <ul>
            {requests.map((cr) => (
              <li key={cr.id} style={{ marginBottom: '1rem' }}>
                <div><strong>{cr.title}</strong> — {cr.status}</div>
                <div style={{ color: '#9ca3af' }}>Env: {cr.environmentId} | Created: {new Date(cr.createdAt).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => transition(cr.id, 'InReview')}>Send to review</button>
                  <button type="button" onClick={() => transition(cr.id, 'Approved')}>Approve</button>
                  <button type="button" onClick={() => transition(cr.id, 'Rejected')}>Reject</button>
                  <button type="button" onClick={() => transition(cr.id, 'Published')}>Publish</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
