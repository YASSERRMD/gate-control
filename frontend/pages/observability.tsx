import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiGet } from '../lib/api';

interface PublishRecord {
  environmentId: string;
  publishedAt: string;
  status: string;
  configHash: string;
}

interface ObservabilityOverview {
  environments: number;
  services: number;
  routes: number;
  changeRequests: Record<string, number>;
  lastPublishes: PublishRecord[];
}

export default function ObservabilityPage() {
  const [overview, setOverview] = useState<ObservabilityOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ObservabilityOverview>('/observability/overview')
      .then(setOverview)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Layout
      title="Observability overview"
      description="Live counts and recent publishes from the admin API."
    >
      <div className="grid">
        <div className="card">
          <h3>Inventory</h3>
          {overview ? (
            <ul>
              <li><strong>{overview.environments}</strong> environments</li>
              <li><strong>{overview.services}</strong> services</li>
              <li><strong>{overview.routes}</strong> routes</li>
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="card">
          <h3>Change request statuses</h3>
          {overview && Object.keys(overview.changeRequests).length > 0 ? (
            <ul>
              {Object.entries(overview.changeRequests).map(([status, count]) => (
                <li key={status} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{status}</span>
                  <span style={{ color: '#93c5fd' }}>{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No change requests have been recorded yet.</p>
          )}
        </div>

        <div className="card">
          <h3>Recent publishes</h3>
          {overview && overview.lastPublishes.length > 0 ? (
            <ul>
              {overview.lastPublishes.map((publish, idx) => (
                <li key={`${publish.environmentId}-${idx}`} style={{ marginBottom: '0.75rem' }}>
                  <div><strong>{publish.environmentId}</strong> — {publish.status}</div>
                  <div style={{ color: '#9ca3af' }}>
                    {new Date(publish.publishedAt).toLocaleString()} | Hash: {publish.configHash}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No publishes have been recorded yet.</p>
          )}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: '#b91c1c', color: '#fecdd3' }}>
          <h4>Failed to load observability data</h4>
          <p>{error}</p>
        </div>
      )}
    </Layout>
  );
}
