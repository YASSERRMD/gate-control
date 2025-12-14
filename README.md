# Gate Control Platform Blueprint

## Overview
An internal admin portal for managing Ocelot API Gateway configurations with full change control, validation, and audited hot-reload publishing.

## Goals and Non-goals
- **Goals:** Provide UI and backend workflow for route and policy management, approval-based publishing, deterministic `ocelot.json` generation, safe hot reload, and comprehensive auditability.
- **Non-goals:** Full API management features (developer portal, monetization, billing), identity provider replacement, and deep runtime analytics beyond operational metrics.

## Target Architecture
- **Admin UI:** React/Next.js web app for CRUD on gateway configs, approvals, diff/validation views, and route testing.
- **Admin Backend API:** ASP.NET Core 8 Web API exposing environment, service, route, change request, and config generation endpoints.
- **Config Store:** File-backed JSON data store for the demo (swap with SQL/EF Core in production).
- **Ocelot Gateway Runtime:** ASP.NET Core app running Ocelot, watching generated `ocelot.json` with `reloadOnChange: true` (not included in this demo repo).
- **Publisher Agent:** Job within backend that can generate and push configs (stubbed via `/api/environments/{environmentId}/ocelot`).
- **Identity Provider:** SSO via OIDC/SAML (Azure AD, Keycloak, etc.) with role mapping (stubbed for demo).

## Personas and Roles
- **Route Editor:** Drafts changes; cannot publish.
- **Approver:** Reviews/approves/rejects with comments; self-approval blocked.
- **Publisher:** Publishes approved changes; may be separate from approver.
- **Auditor:** Read-only access to configs, history, and evidence packs.
- **Admin:** Manages users, roles, environments, and global settings.

### Role Constraints
- Separation of duties: editors cannot self-approve (configurable).
- Approvers cannot publish unless granted.
- Optional break-glass publish with mandatory justification.

## Environments and Governance
- **Environments:** Dev, UAT, Prod—each with BaseUrl, discovery settings, downstream hosts/registry, and secret references only (no secrets stored).
- **Governance:** Mandatory validation before approval; Prod requires approval before publish; optional auto-publish in Dev; full audit trail for all actions.

## Data Model (Logical)
- **Environments:** Id, Name, BaseUrl, DiscoveryProviderType, SettingsJson.
- **Services:** Id, EnvironmentId, Name, DefaultScheme, HostsPortsJson, Tags, health endpoints.
- **Routes:** Id, EnvironmentId, RouteKey, Description, IsActive, UpstreamPathTemplate, UpstreamMethods, DownstreamPathTemplate, DownstreamServiceId (or host overrides), Priority, RequestIdKey.
- **RoutePolicies:** RouteId, AuthPolicyId, RateLimitPolicyId, CachePolicyId, QoSPolicyId, HeaderTransformsJson, QueryTransformsJson, DelegatingHandlersJson, LoadBalancerOptionsJson.
- **GlobalConfig:** EnvironmentId, BaseUrl, RequestIdKey, HttpHandlerOptions, QoSOptions, RateLimitOptions, CacheOptions.
- **ChangeRequests:** Id, EnvironmentId, Title, Description, Status (Draft, InReview, Approved, Rejected, Published), CreatedBy/At, ApprovedBy/At, PublishedBy/At, RiskLevel, RollbackPlan, Justification.
- **ChangeRequestItems:** ChangeRequestId, EntityType (Route, Service, Global), EntityId, BeforeJson, AfterJson.
- **PublishHistory:** Id, EnvironmentId, ChangeRequestId, ConfigVersion, Hash, PublishedBy, PublishedAt, TargetNodes, Result, RollbackReference.
- **AuditLog:** Actor, Action, EntityType, EntityId, Timestamp, CorrelationId, BeforeJson, AfterJson, Reason.

## Functional Scope (Epics)
- **Environment & Service Management:** Create environments; define downstream services with host/port or discovery; reuse services across routes; health endpoints stored for publish verification.
- **Route Builder UI:** Wizard + advanced JSON view; supports auth, rate-limit, QoS, caching, load balancing, transforms, delegating handlers; live validation; route tester shows matching route and downstream URL; invalid routes cannot be saved.
- **Change Requests & Approvals:** Draft -> review -> approve/reject -> publish; diff viewer; validation summary; prevents self-approval; configurable approval counts; staged publishes (e.g., UAT then Prod); every transition logged.
- **Config Generation & Validation:** Deterministic generator outputs `Routes` and `GlobalConfiguration` sections; schema and semantic validation (duplicate upstreams, placeholders, missing services, invalid ranges); runtime safety checks (wildcards, allowlist, IP blocking); optional downstream health check before publish.
- **Hot Reload & Publishing:** Modes: file drop, HTTP push, GitOps; recommended atomic flow writes `ocelot.json.tmp`, validates, atomically renames, triggers reload, health-checks, and rolls back automatically if failures occur.
- **Audit & Compliance:** Immutable audit logs; CSV/PDF export; evidence pack per publish (diff, validation results, approver comments, per-node status); auditor is read-only.
- **Observability:** Dashboard for last publish status, config version/hash per environment, gateway node health, validation error rates; integration hooks for Prometheus/ELK/App Insights; non-admins see only permitted environments.

## Quickstart (Demo Stack)
This repository now includes a runnable demo:
- **Backend:** ASP.NET Core 8 Web API in `backend/` using a file-based JSON store in `data/db.json`.
- **Frontend:** Next.js UI in `frontend/` that consumes the backend API.

### Prerequisites
- .NET 8 SDK
- Node.js 18+ (the container ships with Node 20)

### Running the backend
```
dotnet restore backend/GateControl.Api.csproj
dotnet run --project backend/GateControl.Api.csproj --urls http://localhost:5087
# API available on http://localhost:5087/swagger and /api/*
```

### Running the frontend
```
cd frontend
npm install
npm run dev
# UI available on http://localhost:3000
```
Set `NEXT_PUBLIC_API_BASE` if your API runs on a different origin.

### Available API routes (demo)
- `GET /api/environments` / `POST /api/environments`
- `GET /api/services` / `POST /api/services`
- `GET /api/routes` / `POST /api/routes`
- `GET /api/change-requests` / `POST /api/change-requests`
- `GET /api/environments/{environmentId}/ocelot` to generate an `ocelot.json`-style document

### Persisted sample data
`data/db.json` ships with a Dev environment, an Orders service, and a starter route so the UI shows meaningful content immediately.

## Next steps
- Replace the JSON file with PostgreSQL/SQL Server using an ORM.
- Add RBAC, authentication, and approval rules.
- Extend validators to cover allowlist enforcement and semantic checks.
- Wire publisher jobs to push configs to Ocelot gateway nodes with rollback.
- Expand UI with diff views, validation outputs, and evidence packs per publish.
