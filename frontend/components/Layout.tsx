import Link from 'next/link';
import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Layout({ title, description, children }: Props) {
  return (
    <main>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>{title}</h1>
        {description && <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>{description}</p>}
        <nav style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Link href="/">Home</Link>
          <Link href="/environments">Environments</Link>
          <Link href="/services">Services</Link>
          <Link href="/routes">Routes</Link>
          <Link href="/change-requests">Change Requests</Link>
          <Link href="/observability">Observability</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
