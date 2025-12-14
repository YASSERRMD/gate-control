import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost } from '../lib/api';

interface Environment { id: string; name: string; }
interface ValidationIssue { code: string; message: string; severity?: string; routeId?: string; field?: string; }
interface ValidationReport { issues: ValidationIssue[]; configHash?: string; isValid?: boolean; }
interface PublishRecord {
  id: string;
  environmentId: string;
  changeRequestId?: string;
  configHash: string;
  publishedAt: string;
  status: string;
  publishedBy?: string;
  targetNodes: string[];
  result?: string;
  validationIssues: ValidationIssue[];
}

export default function PublishPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [environmentId, setEnvironmentId] = useState('');
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [history, setHistory] = useState<PublishRecord[]>([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    apiGet<Environment[]>('/environments').then((envs) => {
      setEnvironments(envs);
      if (envs.length) {
        setEnvironmentId(envs[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!environmentId) return;
    apiGet<ValidationReport>(`/environments/${environmentId}/validate`).then(setValidation);
    apiGet<PublishRecord[]>(`/environments/${environmentId}/publish-history`).then(setHistory);
  }, [environmentId]);

  const publish = async () => {
    if (!environmentId) return;
    setPublishing(true);
    try {
      const record = await apiPost<PublishRecord>(`/environments/${environmentId}/publish`, { actor: 'publisher-bot' });
      setHistory((prev) => [record, ...prev]);
      const updatedValidation = await apiGet<ValidationReport>(`/environments/${environmentId}/validate`);
      setValidation(updatedValidation);
    } catch (err) {
      console.error(err);
      alert('Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Layout title="Publish" subtitle="Validate, publish, and review history for gateway configs">
      <div className="card">
        <h3>Select environment</h3>
        <select value={environmentId} onChange={(e) => setEnvironmentId(e.target.value)}>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>{env.name}</option>
          ))}
        </select>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Validation</h3>
          {validation ? (
            <>
              <p>Config hash: {validation.configHash ?? 'pending'}</p>
              <p>Status: {validation.issues.some((i) => i.severity?.toLowerCase() === 'error') ? 'Failed' : 'Passed'}</p>
              <ul>
                {validation.issues.map((issue) => (
                  <li key={`${issue.code}-${issue.routeId ?? ''}-${issue.field ?? ''}`}>
                    <strong>{issue.severity}</strong>: {issue.message}
                  </li>
                ))}
                {!validation.issues.length && <li>No issues detected.</li>}
              </ul>
              <button onClick={publish} disabled={publishing}>Publish</button>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div className="card">
          <h3>History</h3>
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <div><strong>{h.status}</strong> — {new Date(h.publishedAt).toLocaleString()}</div>
                <div>Hash: {h.configHash}</div>
                <div>Result: {h.result}</div>
              </li>
            ))}
            {!history.length && <li>No publishes yet.</li>}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
