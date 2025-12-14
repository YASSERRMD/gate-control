# Ocelot Admin Portal coverage review

This document cross-checks the requested platform capabilities against the current codebase in the `backend` and `frontend` folders and calls out what is present versus what is still missing per epic.

## Current backend snapshot
- ASP.NET Core minimal API exposes CRUD endpoints plus validation, change-request workflow status, publish with deterministic hashing, audit log capture, and observability summaries. RBAC/auth still absent.【F:backend/Program.cs†L4-L149】
- Data is persisted to a JSON file via a simple `DataStore` service. It now tracks audit logs and publish history but still lacks a relational database, migrations, or immutable versioning. Concurrency control remains in-process locking.【F:backend/Services/DataStore.cs†L7-L203】
- Validation service enforces basic semantic checks (dup routes, missing targets, wildcard warnings) and generates a config hash; publisher writes atomic config drops and records validation outcomes, but lacks real gateway integration and rollback logic.【F:backend/Services/ValidationService.cs†L1-L90】【F:backend/Services/PublisherService.cs†L1-L66】

## Current frontend snapshot
- Next.js pages provide basic forms for environments, services, routes, and change requests. A new publishing screen surfaces validation issues, config hashes, and history. There is still no authentication, role awareness, diffing, or approval gating in the UI.【F:frontend/pages/environments.tsx†L1-L71】【F:frontend/pages/services.tsx†L1-L74】【F:frontend/pages/routes.tsx†L1-L134】【F:frontend/pages/change-requests.tsx†L1-L108】【F:frontend/pages/publish.tsx†L1-L97】
- Change request workflow buttons now target a real status endpoint, but server-side enforcement of separation-of-duties and multi-approval rules remains missing.【F:frontend/pages/change-requests.tsx†L58-L101】【F:backend/Program.cs†L79-L103】【F:backend/Services/DataStore.cs†L120-L172】

## Epic-by-epic coverage
- **Epic A (Environment and Service Management):** Basic CRUD exists, but there is no service discovery configuration, health check verification, reusability UI cues, or governance rules.【F:backend/Program.cs†L23-L90】【F:backend/Services/DataStore.cs†L38-L125】【F:frontend/pages/environments.tsx†L18-L64】【F:frontend/pages/services.tsx†L18-L73】
- **Epic B (Route Builder UI):** Simple route creation is present, but lacks validation, advanced options (auth, rate limit, QoS, caching, load balancer, transforms), wizard/test tools, or save blockers for invalid routes.【F:frontend/pages/routes.tsx†L18-L133】【F:backend/Models/RouteModel.cs†L5-L35】
- **Epic C (Change Requests and approvals):** Change request records can be created and statuses updated with audit capture, but there is no diffing, validation summary surface, role-based approval, multi-approval rules, staged publish flow, or comments.【F:backend/Models/ChangeRequest.cs†L5-L27】【F:backend/Program.cs†L98-L153】【F:backend/Services/DataStore.cs†L150-L245】【F:frontend/pages/change-requests.tsx†L58-L101】
- **Epic D (Config generation and validation):** Generator now participates in semantic validation with deterministic hashing, but still lacks full schema validation, safety policies, evidence packs, and downstream health verification.【F:backend/Services/ValidationService.cs†L23-L125】【F:backend/Services/OcelotGenerator.cs†L14-L121】
- **Epic E (Hot reload and publishing):** Publisher writes atomic config drops with validation results and audit logging but lacks node targeting health checks, rollback, and gateway reload orchestration.【F:backend/Services/PublisherService.cs†L23-L75】【F:backend/Program.cs†L143-L153】
- **Epic F (Audit and compliance):** Audit log capture is implemented for mutations and publishes, but there is no export, immutable store, or correlation with evidence packs.【F:backend/Services/DataStore.cs†L61-L252】【F:backend/Program.cs†L155-L158】
- **Epic G (Observability):** An overview endpoint summarizes counts and last publishes, but there is no dashboarding or metrics pipeline; UI still lacks observability views.【F:backend/Services/ObservabilityService.cs†L8-L21】【F:backend/Program.cs†L158-L159】【F:frontend/pages/index.tsx†L5-L25】

## Missing implementation backlog
- Add secure authentication/authorization (OIDC + RBAC) on API endpoints and UI routing with persona-based permissions and separation-of-duties checks.
- Replace the JSON file store with a relational database (PostgreSQL/SQL Server), EF Core migrations, and versioned tables for environments, services, routes, policies, change requests, publish history, and audit logs.
- Expand route models and UI to cover policy options (auth, rate limiting, caching, QoS, load balancing, transforms), validation, and test tooling.
- Implement change request workflow engine with validation results, diffing, multi-approver rules, staged publish, and audit events.
- Build deterministic config generation with schema + semantic validation, hashing, and evidence pack outputs.
- Create publisher/agent handling hot reload, node targeting, health checks, rollback, and publish history recording.
- Add observability endpoints, dashboards, and export/reporting for audit compliance.
