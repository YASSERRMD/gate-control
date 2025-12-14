import Link from 'next/link';
import { Layout } from '../components/Layout';

export default function Home() {
  return (
    <Layout
      title="Gate Control"
      description="Admin UI for Ocelot gateway routes, approvals, and hot-reload publishing."
    >
      <div className="grid">
        <div className="card">
          <h2>Quick start</h2>
          <p>Create environments, services, and routes, then bundle them into change requests for approval and publish.</p>
          <ul>
            <li>Read/Write APIs exposed at <code>http://localhost:4000/api</code></li>
            <li>UI pages in this Next.js app call the same API</li>
          </ul>
        </div>
        <div className="card">
          <h2>Navigation</h2>
          <ul>
            <li><Link href="/environments">Manage environments</Link></li>
            <li><Link href="/services">Service catalog</Link></li>
            <li><Link href="/routes">Route builder</Link></li>
            <li><Link href="/change-requests">Change requests & approvals</Link></li>
            <li><Link href="/observability">Observability overview</Link></li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
