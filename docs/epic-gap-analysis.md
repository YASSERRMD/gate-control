# Ocelot Admin Portal coverage review

This document cross-checks the requested platform capabilities against the current codebase in the `backend` and `frontend` folders and calls out what is present versus what is still missing per epic.

## Current backend snapshot
- Minimal ASP.NET Core minimal API exposing CRUD endpoints for environments, services, routes, and change requests plus an Ocelot config generator endpoint; there is no authentication, RBAC, approvals, validation, publishing, or audit logic yet.【F:backend/Program.cs†L4-L130】
- Data is persisted to a JSON file via a simple `DataStore` service rather than a relational database or migrations; no concurrency control beyond in-process locking and no version history is kept.【F:backend/Services/DataStore.cs†L7-L199】
- The Ocelot generator simply maps stored routes to an `OcelotConfig` without schema/semantic validation, hashing, audit, or publish orchestration.【F:backend/Services/OcelotGenerator.cs†L14-L121】

## Current frontend snapshot
- Next.js pages provide basic forms for environments, services, routes, and change requests that POST directly to the backend; there is no authentication, role awareness, validation, diffing, or approval gating in the UI.【F:frontend/pages/environments.tsx†L1-L71】【F:frontend/pages/services.tsx†L1-L74】【F:frontend/pages/routes.tsx†L1-L134】【F:frontend/pages/change-requests.tsx†L1-L108】
- The change request page calls a `/change-requests/{id}/status` endpoint for workflow transitions, but no such endpoint exists in the backend, so the workflow buttons cannot function.【F:frontend/pages/change-requests.tsx†L58-L101】【F:backend/Program.cs†L92-L113】

## Epic-by-epic coverage
- **Epic A (Environment and Service Management):** Basic CRUD exists, but there is no service discovery configuration, health check verification, reusability UI cues, or governance rules.【F:backend/Program.cs†L23-L90】【F:backend/Services/DataStore.cs†L38-L125】【F:frontend/pages/environments.tsx†L18-L64】【F:frontend/pages/services.tsx†L18-L73】
- **Epic B (Route Builder UI):** Simple route creation is present, but lacks validation, advanced options (auth, rate limit, QoS, caching, load balancer, transforms), wizard/test tools, or save blockers for invalid routes.【F:frontend/pages/routes.tsx†L18-L133】【F:backend/Models/RouteModel.cs†L5-L35】
- **Epic C (Change Requests and approvals):** Change request records can be created but there is no diffing, validation summary, role-based approval, multi-approval rules, staged publish flow, or audit logging; even status transitions are unimplemented server-side.【F:backend/Models/ChangeRequest.cs†L5-L27】【F:backend/Program.cs†L92-L113】【F:frontend/pages/change-requests.tsx†L58-L101】
- **Epic D (Config generation and validation):** Generator exists but is non-deterministic across processes (no hashing), lacks schema/semantic validation, conflict checks, safety policies, and health verification; no evidence pack or deterministic hashing is stored.【F:backend/Services/OcelotGenerator.cs†L14-L121】
- **Epic E (Hot reload and publishing):** There is no publisher, hot reload control, atomic file handling, node targeting, health checks, or rollback logic implemented in code.【F:backend/Program.cs†L4-L130】
- **Epic F (Audit and compliance):** No audit log model, export, evidence pack, or immutable history exists; the JSON store tracks only the latest object versions with no actor or correlation metadata.【F:backend/Services/DataStore.cs†L18-L199】【F:backend/Models/DataModel.cs†L4-L9】
- **Epic G (Observability):** No dashboards, metrics collection, or health surfacing are present in backend or frontend; only Swagger UI is available.【F:backend/Program.cs†L12-L130】【F:frontend/pages/index.tsx†L5-L25】

## Missing implementation backlog
- Add secure authentication/authorization (OIDC + RBAC) on API endpoints and UI routing with persona-based permissions and separation-of-duties checks.
- Replace the JSON file store with a relational database (PostgreSQL/SQL Server), EF Core migrations, and versioned tables for environments, services, routes, policies, change requests, publish history, and audit logs.
- Expand route models and UI to cover policy options (auth, rate limiting, caching, QoS, load balancing, transforms), validation, and test tooling.
- Implement change request workflow engine with validation results, diffing, multi-approver rules, staged publish, and audit events.
- Build deterministic config generation with schema + semantic validation, hashing, and evidence pack outputs.
- Create publisher/agent handling hot reload, node targeting, health checks, rollback, and publish history recording.
- Add observability endpoints, dashboards, and export/reporting for audit compliance.
