import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost, apiPut, apiDelete, Route, Service, Environment } from '../lib/api';

export default function Routes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      apiGet<Route[]>('/routes'),
      apiGet<Service[]>('/services'),
      apiGet<Environment[]>('/environments')
    ])
      .then(([rts, svcs, envs]) => {
        setRoutes(rts);
        setServices(svcs);
        setEnvironments(envs);
        setLoading(false);
      })
      .catch(console.error);
  };

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || serviceId;
  };

  const getEnvironmentName = (envId: string) => {
    return environments.find(e => e.id === envId)?.name || envId;
  };

  return (
    <Layout title="Routes Management" subtitle="Configure and manage API Gateway routes">
      <div className="content-section">
        <div className="section-header">
          <h3><i className="fas fa-route"></i> All Routes</h3>
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i> Add New Route
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Route Key</th>
              <th>Description</th>
              <th>Upstream Path</th>
              <th>Service</th>
              <th>Environment</th>
              <th>Methods</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.id}>
                <td style={{ fontWeight: 700, color: '#58a6ff' }}>{route.routeKey}</td>
                <td>{route.description}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{route.upstreamPathTemplate}</td>
                <td>{getServiceName(route.downstreamServiceId)}</td>
                <td>{getEnvironmentName(route.environmentId)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {route.upstreamMethods.map(method => (
                      <span key={method} className="status-badge" style={{ fontSize: '10px', padding: '3px 8px' }}>
                        {method}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="action-icons">
                    <div className="action-icon"><i className="fas fa-eye"></i></div>
                    <div className="action-icon"><i className="fas fa-edit"></i></div>
                    <div className="action-icon"><i className="fas fa-trash"></i></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
