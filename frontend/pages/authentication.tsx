import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface AuthPolicy {
    id: string;
    name: string;
    scheme: string;
    provider: string;
    authority: string;
    allowedScopes: string[];
    requireHttps: boolean;
    enabled: boolean;
}

export default function AuthenticationPage() {
    const [policies, setPolicies] = useState<AuthPolicy[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        scheme: 'Bearer',
        provider: 'IdentityServer',
        authority: '',
        allowedScopes: '',
        requireHttps: true
    });

    useEffect(() => {
        apiGet<AuthPolicy[]>('/authenticationPolicies').then(setPolicies).catch(console.error);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                allowedScopes: form.allowedScopes.split(',').map(s => s.trim()).filter(Boolean),
                enabled: true
            };
            const created = await apiPost<AuthPolicy>('/authenticationPolicies', payload);
            setPolicies(prev => [...prev, created]);
            setForm({ name: '', scheme: 'Bearer', provider: 'IdentityServer', authority: '', allowedScopes: '', requireHttps: true });
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create policy');
        }
    };

    return (
        <Layout title="Authentication Policies" subtitle="Configure authentication schemes and identity providers">
            <div className="grid">
                <div className="card">
                    <h3>Authentication Policies</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Scheme</th>
                                <th>Provider</th>
                                <th>Scopes</th>
                                <th>HTTPS Required</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((policy) => (
                                <tr key={policy.id}>
                                    <td><strong>{policy.name}</strong></td>
                                    <td><span className="badge">{policy.scheme.toUpperCase()}</span></td>
                                    <td>{policy.provider}</td>
                                    <td>{policy.allowedScopes?.join(', ') || 'N/A'}</td>
                                    <td>{policy.requireHttps ? '✓ Yes' : '✗ No'}</td>
                                    <td>
                                        <span className={`status-badge ${policy.enabled ? 'success' : 'inactive'}`}>
                                            {policy.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-sm">Edit</button>
                                        <button className="btn-sm btn-danger">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>{showForm ? 'Add New Policy' : 'Quick Actions'}</h3>
                    {showForm ? (
                        <form onSubmit={submit}>
                            <div className="form-group">
                                <label>Policy Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. JWT Auth Policy" required />
                            </div>
                            <div className="form-group">
                                <label>Scheme</label>
                                <select value={form.scheme} onChange={e => setForm({ ...form, scheme: e.target.value })}>
                                    <option value="Bearer">Bearer</option>
                                    <option value="Basic">Basic</option>
                                    <option value="ApiKey">API Key</option>
                                    <option value="OAuth2">OAuth2</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Provider</label>
                                <select value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })}>
                                    <option value="IdentityServer">IdentityServer</option>
                                    <option value="Auth0">Auth0</option>
                                    <option value="AzureAD">Azure AD</option>
                                    <option value="Okta">Okta</option>
                                    <option value="Custom">Custom</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Authority URL</label>
                                <input value={form.authority} onChange={e => setForm({ ...form, authority: e.target.value })} placeholder="https://auth.example.com" required />
                            </div>
                            <div className="form-group">
                                <label>Allowed Scopes (comma-separated)</label>
                                <input value={form.allowedScopes} onChange={e => setForm({ ...form, allowedScopes: e.target.value })} placeholder="read, write, admin" />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" checked={form.requireHttps} onChange={e => setForm({ ...form, requireHttps: e.target.checked })} style={{ marginRight: '8px' }} />
                                    Require HTTPS
                                </label>
                            </div>
                            <button type="submit" className="btn-primary">Save Policy</button>
                            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
                        </form>
                    ) : (
                        <>
                            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add New Policy</button>
                            <button className="btn" onClick={() => window.open('https://ocelot.readthedocs.io/en/latest/features/authentication.html', '_blank')}>View Documentation</button>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
