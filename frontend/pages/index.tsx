import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, ChangeRequest, Route, Environment } from '../lib/api';

export default function Home() {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<ChangeRequest[]>('/change-requests'),
      apiGet<Route[]>('/routes'),
      apiGet<Environment[]>('/environments')
    ])
      .then(([crs, rts, envs]) => {
        setChangeRequests(crs);
        setRoutes(rts);
        setEnvironments(envs);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const pendingApprovals = changeRequests.filter(cr => cr.status === 'pending').length;
  const publishedThisWeek = changeRequests.filter(cr => cr.status === 'published').length;

  return (
    <Layout title="Control Center" subtitle="Monitor and manage your API Gateway infrastructure">
      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card blue">
          <div className="stat-card-header">
            <div className="stat-icon blue">
              <i className="fas fa-route"></i>
            </div>
          </div>
          <div className="stat-value">{routes.length}</div>
          <div className="stat-label">Active Routes</div>
          <div className="stat-trend up">
            <i className="fas fa-arrow-up"></i> 12% increase
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-header">
            <div className="stat-icon green">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="stat-value">{pendingApprovals}</div>
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-trend down">
            <i className="fas fa-arrow-down"></i> 3 less today
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-card-header">
            <div className="stat-icon orange">
              <i className="fas fa-server"></i>
            </div>
          </div>
          <div className="stat-value">5/5</div>
          <div className="stat-label">Healthy Gateway Nodes</div>
          <div className="stat-trend up">
            <i className="fas fa-check"></i> All operational
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-header">
            <div className="stat-icon purple">
              <i className="fas fa-rocket"></i>
            </div>
          </div>
          <div className="stat-value">{publishedThisWeek}</div>
          <div className="stat-label">Deployments This Week</div>
          <div className="stat-trend up">
            <i className="fas fa-arrow-up"></i> 100% success
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="content-section">
        <div className="section-header">
          <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
        </div>
        <div className="quick-actions">
          <div className="quick-action-card" onClick={() => window.location.href = '/routes'}>
            <i className="fas fa-plus-circle"></i>
            <h4>Create New Route</h4>
          </div>
          <div className="quick-action-card" onClick={() => window.location.href = '/services'}>
            <i className="fas fa-server"></i>
            <h4>Add Service</h4>
          </div>
          <div className="quick-action-card" onClick={() => window.location.href = '/change-requests'}>
            <i className="fas fa-edit"></i>
            <h4>New Change Request</h4>
          </div>
          <div className="quick-action-card" onClick={() => window.location.href = '/config-generator'}>
            <i className="fas fa-cog"></i>
            <h4>Generate Config</h4>
          </div>
          <div className="quick-action-card" onClick={() => window.location.href = '/validator'}>
            <i className="fas fa-check-double"></i>
            <h4>Validate Config</h4>
          </div>
          <div className="quick-action-card" onClick={() => window.location.href = '/audit-logs'}>
            <i className="fas fa-file-medical-alt"></i>
            <h4>View Audit Report</h4>
          </div>
        </div>
      </div>

      {/* Recent Change Requests */}
      <div className="content-section">
        <div className="section-header">
          <h3><i className="fas fa-tasks"></i> Recent Change Requests</h3>
          <button className="btn btn-primary" onClick={() => window.location.href = '/change-requests'}>
            <i className="fas fa-plus"></i> New Request
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {changeRequests.slice(0, 4).map(cr => {
              const env = environments.find(e => e.id === cr.environmentId);
              return (
                <tr key={cr.id}>
                  <td style={{ color: '#58a6ff', fontWeight: 700 }}>{cr.id}</td>
                  <td style={{ fontWeight: 600 }}>{cr.title}</td>
                  <td>{env?.name || cr.environmentId}</td>
                  <td><span className={`status-badge ${cr.status}`}>{cr.status}</span></td>
                  <td>{cr.createdBy}</td>
                  <td><span className={`status-badge ${cr.riskLevel}`}>{cr.riskLevel}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Activity Timeline */}
      <div className="content-section">
        <div className="section-header">
          <h3><i className="fas fa-clock"></i> Recent Activity</h3>
          <button className="btn btn-secondary">
            View All
          </button>
        </div>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-content">
              <h4>Configuration Published to Production</h4>
              <p>Change Request #CR-1020 was successfully deployed to all production gateway nodes with zero downtime</p>
              <span className="time"><i className="fas fa-user"></i> John Doe • 15 minutes ago</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-content">
              <h4>Change Request Approved</h4>
              <p>Change Request #CR-1023 received security team approval and is ready for deployment</p>
              <span className="time"><i className="fas fa-user-shield"></i> Security Admin • 1 hour ago</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-content">
              <h4>New Route Created</h4>
              <p>Route &quot;/api/v2/customers&quot; was successfully added to the UAT environment</p>
              <span className="time"><i className="fas fa-user"></i> Carol White • 3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
