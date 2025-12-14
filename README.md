# Gate Control Platform

A comprehensive Ocelot API Gateway configuration management platform built with ASP.NET Core backend and Next.js frontend. Manage environments, services, routes, and advanced gateway features with a beautiful glassmorphism UI.

![Gate Control](https://img.shields.io/badge/Ocelot-Gateway%20Manager-667eea?style=for-the-badge)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

## ✨ Features

### Core Features
- **Environment Management** - Create and manage multiple deployment environments (Dev, Staging, Production)
- **Service Registry** - Define downstream services with host configurations and tags
- **Route Configuration** - Configure upstream/downstream path mappings with HTTP methods
- **Ocelot Config Generation** - Auto-generate valid `ocelot.json` files from UI configurations
- **Change Request Workflow** - Track configuration changes with approval workflow

### Security & Policy Management
- **Authentication Policies** - Configure JWT/OAuth2 bearer authentication with scopes
- **Rate Limiting** - Define request rate limits with customizable periods and quotas
- **Caching Policies** - Set up response caching with TTL, regions, and vary-by options
- **Quality of Service (QoS)** - Configure circuit breakers, timeouts, and retry policies
- **Load Balancing** - Set up round-robin, least-connection, and weighted algorithms

### Import & Export
- **Ocelot Config Import** - Import existing `ocelot.json` files directly into the platform
  - Supports JavaScript-style comments (`//` and `/* */`)
  - Parses `CacheOptions` and `FileCacheOptions`
  - Uses custom `RouteKey` if provided
  - Auto-creates environments and services from config
  - Supports `ServiceName` for Consul/Eureka service discovery

### User & Access Management
- **User Management** - Create and manage platform users
- **Roles & Permissions** - Define roles with granular permissions
- **Settings** - Configure platform-wide settings

### Observability
- **Gateway Health** - Monitor gateway health status
- **Metrics Dashboard** - View request counts, latency, and error rates
- **Audit Logs** - Track all configuration changes

## 🚀 Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/YASSERRMD/gate-control.git
cd gate-control

# Start with Docker Compose
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5087
# Swagger UI: http://localhost:5087/swagger
```

## 🛠️ Manual Setup

### Prerequisites
- .NET 8 SDK
- Node.js 18+ (Node 20 recommended)

### Run the Backend
```bash
cd backend
dotnet restore
dotnet run --urls http://localhost:5087

# Swagger UI: http://localhost:5087/swagger
```

### Run the Frontend
```bash
cd frontend
npm install
npm run dev

# App: http://localhost:3000
```

Set `NEXT_PUBLIC_API_BASE` if your API runs on a different origin. Default is `http://localhost:5087/api`.

## 📁 Project Structure

```
gate-control/
├── backend/                    # ASP.NET Core Minimal API
│   ├── Models/                 # Data models (Route, Service, Environment, etc.)
│   ├── Services/               # Business logic (DataStore, OcelotImportService)
│   └── Program.cs              # API endpoints and configuration
├── frontend/                   # Next.js 14 Application
│   ├── components/             # Reusable React components
│   ├── pages/                  # Next.js pages (routes, services, etc.)
│   ├── lib/                    # API client and utilities
│   └── styles/                 # Global CSS with glassmorphism design
├── data/                       # JSON data store
│   └── db.json                 # Persistent data file
├── docs/                       # Documentation
└── docker-compose.yml          # Docker orchestration
```

## 🔌 API Endpoints

### Core Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/environments` | Manage environments |
| GET/POST | `/api/services` | Manage services |
| GET/POST | `/api/routes` | Manage routes |
| GET/POST | `/api/change-requests` | Manage change requests |

### Ocelot Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/environments/{id}/ocelot` | Generate ocelot.json |
| GET | `/api/environments/{id}/validate` | Validate configuration |
| POST | `/api/environments/{id}/publish` | Record publish event |
| POST | `/api/import/ocelot` | Import Ocelot configuration |

### Security Policies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/authenticationPolicies` | Auth policies |
| GET/POST | `/api/rateLimitPolicies` | Rate limit rules |
| GET/POST | `/api/cachingPolicies` | Caching policies |
| GET/POST | `/api/qosPolicies` | QoS configurations |
| GET/POST | `/api/loadBalancers` | Load balancer configs |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/users` | Manage users |
| GET/POST | `/api/roles` | Manage roles |

## 🎨 UI Features

- **Glassmorphism Design** - Modern frosted glass aesthetic
- **Dark Mode** - Full dark mode support with toggle
- **Responsive Layout** - Works on desktop and tablet
- **Real-time Validation** - Form validation with helpful error messages

## 📖 Documentation

See [docs/doc.md](docs/doc.md) for detailed usage instructions.

## 📝 Data Persistence

Data is stored in `data/db.json`. Edit this file directly to:
- Reset demo data
- Pre-seed additional records
- Backup/restore configurations

## ⚠️ Notes

- This is a **demo/development platform** - authentication, RBAC, and production-ready security are not included
- Use in production environments at your own risk
- Ideal for local development, testing, and configuration prototyping

## 📜 License

MIT License - Feel free to use and modify for your projects.
