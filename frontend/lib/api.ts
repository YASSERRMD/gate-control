const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5087/api';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} ${error}`);
  }
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PUT ${path} failed: ${res.status} ${error}`);
  }
  return res.json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error(`DELETE ${path} failed: ${res.status}`);
  }
}

// Type definitions
export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  discoveryProviderType: string;
  settingsJson: any;
}

export interface Service {
  id: string;
  environmentId: string;
  name: string;
  defaultScheme: string;
  hosts: { host: string; port: number }[];
  tags: string[];
  healthEndpoint: string;
}

export interface Route {
  id: string;
  environmentId: string;
  routeKey: string;
  description: string;
  upstreamPathTemplate: string;
  upstreamMethods: string[];
  downstreamPathTemplate: string;
  downstreamServiceId: string;
  priority: number;
  requestIdKey: string;
  policies: any;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  environmentId: string;
  status: string;
  riskLevel: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  changes: any;
}

export interface PublishHistory {
  id: string;
  environmentId: string;
  changeRequestId: string;
  publishedBy: string;
  publishedAt: string;
  targetNodes: string[];
  status: string;
  configVersion: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}
