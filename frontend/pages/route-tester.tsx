import { useState } from 'react';
import Layout from '../components/Layout';

export default function RouteTestPage() {
    const [testResult, setTestResult] = useState<any>(null);
    const [form, setForm] = useState({
        method: 'GET',
        path: '/api/v1/orders',
        headers: '{"Authorization": "Bearer test-token"}',
        body: ''
    });

    const runTest = async () => {
        // Simulate test execution
        setTestResult({
            status: 200,
            statusText: 'OK',
            responseTime: 145,
            headers: {
                'content-type': 'application/json',
                'x-correlation-id': 'abc-123'
            },
            body: '{"success": true, "data": []}'
        });
    };

    return (
        <Layout title="Route Tester" subtitle="Test API routes with sample requests">
            <div className="grid">
                <div className="card">
                    <h3>Test Configuration</h3>
                    <div className="form-group">
                        <label>HTTP Method</label>
                        <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                            <option>PATCH</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Path</label>
                        <input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Headers (JSON)</label>
                        <textarea value={form.headers} onChange={(e) => setForm({ ...form, headers: e.target.value })} rows={4} />
                    </div>
                    <div className="form-group">
                        <label>Body (JSON)</label>
                        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} />
                    </div>
                    <button className="btn-primary" onClick={runTest}>Run Test</button>
                </div>

                {testResult && (
                    <div className="card">
                        <h3>Test Results</h3>
                        <div className="result-section">
                            <p><strong>Status:</strong> <span className="badge success">{testResult.status} {testResult.statusText}</span></p>
                            <p><strong>Response Time:</strong> {testResult.responseTime}ms</p>
                            <h4>Response Headers</h4>
                            <pre>{JSON.stringify(testResult.headers, null, 2)}</pre>
                            <h4>Response Body</h4>
                            <pre>{testResult.body}</pre>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
