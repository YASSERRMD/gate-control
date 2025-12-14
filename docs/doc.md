# Gate Control Platform - User Guide

This guide explains how to use the Gate Control Platform to manage your Ocelot API Gateway configurations.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Environments](#managing-environments)
4. [Managing Services](#managing-services)
5. [Managing Routes](#managing-routes)
6. [Importing Ocelot Configuration](#importing-ocelot-configuration)
7. [Security Policies](#security-policies)
8. [Generating Ocelot Config](#generating-ocelot-config)
9. [API Reference](#api-reference)

---

## Getting Started

### Starting the Platform

**Using Docker (Recommended):**
```bash
docker-compose up --build -d
```

**Manual Setup:**
```bash
# Terminal 1 - Backend
cd backend && dotnet run --urls http://localhost:5087

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

Access the application at **http://localhost:3000**

---

## Dashboard Overview

The dashboard provides a quick overview of your gateway configuration:

- **Total Environments** - Number of configured environments
- **Total Services** - Number of registered downstream services
- **Active Routes** - Number of route configurations
- **Pending Changes** - Change requests awaiting approval

### Navigation

The sidebar provides access to all platform features:

| Section | Features |
|---------|----------|
| **Main** | Dashboard, Environments, Services, Routes |
| **Policies & Security** | Authentication, Rate Limiting, Caching, QoS, Load Balancing |
| **Access Control** | Users, Roles & Permissions |
| **Monitoring** | Gateway Health, Metrics |
| **Tools** | Import Config, Settings |

---

## Managing Environments

Environments represent deployment stages (Development, Staging, Production).

### Creating an Environment

1. Navigate to **Environments** in the sidebar
2. Fill in the form:
   - **Environment Name** - e.g., "Production"
   - **Base URL** - e.g., "https://api.example.com"
   - **Description** - Optional description
3. Click **Create Environment**

### Environment Properties

| Property | Description | Example |
|----------|-------------|---------|
| Name | Environment identifier | Production |
| Base URL | Gateway base URL | https://api.example.com |
| Service Discovery | Consul/Eureka type | Consul |

---

## Managing Services

Services represent your downstream microservices.

### Creating a Service

1. Navigate to **Services**
2. Fill in the form:
   - **Service Name** - e.g., "Orders API"
   - **Environment** - Select target environment
   - **Default Scheme** - http or https
   - **Hosts** - Host:Port combinations
   - **Tags** - For organizing services
3. Click **Create Service**

### Service Discovery

For Consul/Eureka integration, services can use:
- `UseServiceDiscovery: true`
- `ServiceDiscoveryName: "orders-service"`

---

## Managing Routes

Routes define how incoming requests are forwarded to downstream services.

### Creating a Route

1. Navigate to **Routes**
2. Fill in:
   - **Route Key** - Unique identifier (e.g., "Orders_GetAll")
   - **Upstream Path** - Incoming path pattern (e.g., "/api/orders/{everything}")
   - **Downstream Path** - Target path (e.g., "/v1/orders/{everything}")
   - **HTTP Methods** - GET, POST, PUT, DELETE, etc.
   - **Service** - Select downstream service
3. Click **Create Route**

### Path Parameters

Use `{placeholder}` syntax for dynamic path segments:
- `{id}` - Named parameter
- `{everything}` - Catch-all for remaining path

---

## Importing Ocelot Configuration

Import existing Ocelot configurations directly into the platform.

### Import via UI

1. Navigate to **Environments**
2. Click **Import Ocelot Config** button
3. Choose input method:
   - **Upload File** - Select your `ocelot.json` file
   - **Paste JSON** - Paste configuration directly
4. Enter **Environment Name**
5. Click **Import Configuration**

### Import via API

```bash
curl -X POST http://localhost:5087/api/import/ocelot \
  -H "Content-Type: application/json" \
  -d '{
    "environmentName": "Production",
    "config": {
      "GlobalConfiguration": {
        "BaseUrl": "https://api.example.com",
        "ServiceDiscoveryProvider": {
          "Type": "Consul",
          "Host": "localhost",
          "Port": 8500
        }
      },
      "Routes": [
        {
          "RouteKey": "Orders_GetAll",
          "UpstreamPathTemplate": "/api/orders",
          "DownstreamPathTemplate": "/v1/orders",
          "DownstreamScheme": "https",
          "DownstreamHostAndPorts": [
            { "Host": "orders-service", "Port": 443 }
          ]
        }
      ]
    }
  }'
```

### Supported Features

| Feature | Support |
|---------|---------|
| Routes / ReRoutes | ✅ Both supported |
| DownstreamHostAndPorts | ✅ Creates services automatically |
| ServiceName | ✅ For service discovery |
| AuthenticationOptions | ✅ Parsed to policies |
| RateLimitOptions | ✅ Parsed to policies |
| CacheOptions / FileCacheOptions | ✅ Both supported |
| RouteKey | ✅ Uses if provided |
| JavaScript Comments | ✅ Stripped automatically |

---

## Security Policies

### Authentication Policies

Configure JWT/OAuth2 authentication:

1. Navigate to **Authentication**
2. Click **+ Add New Policy**
3. Configure:
   - **Policy Name** - e.g., "Bearer Auth"
   - **Provider Key** - e.g., "Bearer"
   - **Authority URL** - OAuth2 server URL
   - **Allowed Scopes** - Comma-separated scopes
4. Click **Save Policy**

### Rate Limiting

Configure request rate limits:

1. Navigate to **Rate Limiting**
2. Click **+ Add New Rule**
3. Configure:
   - **Rule Name** - e.g., "API Limit"
   - **Period** - e.g., "1m" (1 minute)
   - **Limit** - Maximum requests per period
4. Click **Save Rule**

### Caching Policies

Configure response caching:

1. Navigate to **Caching**
2. Click **+ Add New Policy**
3. Configure:
   - **Policy Name** - e.g., "Short Cache"
   - **TTL (seconds)** - Cache duration
   - **Region** - Cache region
   - **Vary By Query** - Include query string in cache key
   - **Vary By Headers** - Headers to include in cache key
4. Click **Save Policy**

### Quality of Service (QoS)

Configure circuit breakers and timeouts:

1. Navigate to **QoS**
2. Click **+ Add New Policy**
3. Configure:
   - **Policy Name** - e.g., "Default QoS"
   - **Timeout (ms)** - Request timeout
   - **Exceptions Before Breaking** - Circuit breaker threshold
   - **Break Duration (ms)** - Time to keep circuit open
4. Click **Save Policy**

---

## Generating Ocelot Config

Generate a valid `ocelot.json` from your configuration:

### Via API

```bash
# Generate config for environment
curl http://localhost:5087/api/environments/{environmentId}/ocelot

# Validate configuration
curl http://localhost:5087/api/environments/{environmentId}/validate

# Publish configuration
curl -X POST http://localhost:5087/api/environments/{environmentId}/publish
```

### Generated Config Format

```json
{
  "GlobalConfiguration": {
    "BaseUrl": "https://api.example.com",
    "ServiceDiscoveryProvider": {
      "Type": "Consul"
    }
  },
  "Routes": [
    {
      "RouteKey": "Orders_GetAll",
      "UpstreamPathTemplate": "/api/orders",
      "UpstreamHttpMethod": ["GET"],
      "DownstreamPathTemplate": "/v1/orders",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        { "Host": "orders-service", "Port": 443 }
      ]
    }
  ]
}
```

---

## API Reference

### Base URL
```
http://localhost:5087/api
```

### Endpoints

#### Environments
```
GET    /environments          # List all
POST   /environments          # Create new
GET    /environments/{id}     # Get by ID
DELETE /environments/{id}     # Delete
```

#### Services
```
GET    /services              # List all
POST   /services              # Create new
GET    /services/{id}         # Get by ID
DELETE /services/{id}         # Delete
```

#### Routes
```
GET    /routes                # List all
POST   /routes                # Create new
GET    /routes/{id}           # Get by ID
DELETE /routes/{id}           # Delete
```

#### Ocelot Operations
```
GET    /environments/{id}/ocelot     # Generate config
GET    /environments/{id}/validate   # Validate
POST   /environments/{id}/publish    # Publish
POST   /import/ocelot                # Import config
```

#### Policies
```
GET/POST  /authenticationPolicies    # Auth policies
GET/POST  /rateLimitPolicies         # Rate limits
GET/POST  /cachingPolicies           # Caching
GET/POST  /qosPolicies               # QoS
GET/POST  /loadBalancers             # Load balancing
```

---

## Tips & Best Practices

1. **Environment Naming** - Use consistent naming (Dev, Staging, Prod)
2. **Route Keys** - Use descriptive keys like "Service_Action" (e.g., "Orders_Create")
3. **Tags** - Tag services by team, domain, or criticality
4. **Validation** - Always validate before publishing
5. **Import** - Import existing configs before making changes

---

## Troubleshooting

### Frontend Not Loading
- Ensure backend is running on port 5087
- Check browser console for CORS errors
- Verify `NEXT_PUBLIC_API_BASE` environment variable

### Import Failing
- Check JSON syntax (use a validator)
- Ensure Routes array exists
- Remove unsupported properties

### Data Not Persisting
- Check `data/db.json` file permissions
- Verify Docker volume mounts

---

## Support

For issues and feature requests, please open an issue on GitHub.
