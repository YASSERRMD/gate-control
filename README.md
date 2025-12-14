# Gate Control Platform

A demo stack that pairs a minimal ASP.NET Core backend with a Next.js frontend to manage Ocelot gateway configurations. Use it to explore environment, service, and route definitions, generate Ocelot configs, and track change requests with lightweight observability data.

## What's in the repo
- **Backend (`backend/`):** Minimal API exposing CRUD endpoints for environments, services, routes, and change requests, plus Ocelot config generation, validation, publish history, and audit logs. Data is persisted to `data/db.json`.
- **Frontend (`frontend/`):** Next.js UI that calls the backend API to visualize and edit environments, services, routes, change requests, and observability summaries.
- **Sample data (`data/db.json`):** Includes a Dev environment, an Orders service, and an example route so the UI renders meaningful content immediately.

## Prerequisites
- .NET 8 SDK
- Node.js 18+ (Node 20 is included in the devcontainer)

## Run the backend
```bash
dotnet restore backend/GateControl.Api.csproj
dotnet run --project backend/GateControl.Api.csproj --urls http://localhost:5087
# Swagger UI available at http://localhost:5087/swagger
```

## Run the frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```
Set `NEXT_PUBLIC_API_BASE` if your API runs on a different origin. The default is `http://localhost:5087/api`.

## Key API routes (demo)
- `GET/POST /api/environments`
- `GET/POST /api/services`
- `GET/POST /api/routes`
- `GET/POST /api/change-requests`
- `GET /api/environments/{environmentId}/ocelot` to generate an `ocelot.json`-style document
- `GET /api/environments/{environmentId}/validate` for validation results
- `POST /api/environments/{environmentId}/publish` to record a publish event
- `GET /api/observability/overview` for basic metrics

## Data persistence
The JSON data store (`data/db.json`) is updated by the API; edit it directly to reset the demo or pre-seed additional records.

## Notes
- This repository focuses on the demo experience—authentication, RBAC, and production-ready publishing are not included.
- The blueprint proposal has been removed in favor of the actual runnable stack documented above.
