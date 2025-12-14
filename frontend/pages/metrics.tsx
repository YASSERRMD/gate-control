import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet } from '../lib/api';

interface Metrics {
    throughput: Array<{ timestamp: string; requestsPerSecond: number }>;
    latency: { p50: number; p95: number; p99: number };
    errorRates: Array<{ route: string; errorRate: number }>;
    topRoutes: Array<{ route: string; requests: number }>;
}

export default function MetricsPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);

    useEffect(() => {
        apiGet<Metrics>('/metrics').then(setMetrics).catch(console.error);
    }, []);

    if (!metrics) return <Layout title="Metrics" subtitle="Gateway performance metrics and analytics"><div>Loading...</div></Layout>;

    return (
        <Layout title="Metrics Dashboard" subtitle="Real-time gateway performance metrics">
            <div className="grid">
                <div className="card">
                    <h3>Latency Percentiles</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{metrics.latency.p50}ms</div>
                            <div className="stat-label">P50 Latency</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{metrics.latency.p95}ms</div>
                            <div className="stat-label">P95 Latency</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{metrics.latency.p99}ms</div>
                            <div className="stat-label">P99 Latency</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Throughput (Last Hour)</h3>
                    <div className="chart-placeholder">
                        {metrics.throughput.map((point, idx) => (
                            <div key={idx} className="chart-point">
                                {new Date(point.timestamp).toLocaleTimeString()}: {point.requestsPerSecond} req/s
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>Error Rates by Route</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Route</th>
                                <th>Error Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.errorRates.map((er) => (
                                <tr key={er.route}>
                                    <td><code>{er.route}</code></td>
                                    <td>
                                        <span className={`badge ${er.errorRate > 0.05 ? 'error' : 'success'}`}>
                                            {(er.errorRate * 100).toFixed(2)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>Top Routes by Traffic</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Route</th>
                                <th>Total Requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.topRoutes.map((route) => (
                                <tr key={route.route}>
                                    <td><code>{route.route}</code></td>
                                    <td>{route.requests.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
