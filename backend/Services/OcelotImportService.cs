using System.Text.Json;
using System.Text.Json.Nodes;
using GateControl.Api.Models;

namespace GateControl.Api.Services;

public class OcelotImportService
{
    private readonly DataStore _dataStore;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public OcelotImportService(DataStore dataStore)
    {
        _dataStore = dataStore;
    }

    public ImportResult Import(JsonNode ocelotConfig, string environmentName = "Imported")
    {
        var result = new ImportResult();
        
        // Create or find environment
        var envId = CreateEnvironment(ocelotConfig, environmentName);
        result.EnvironmentId = envId;
        result.EnvironmentCreated = true;

        // Parse Routes (or ReRoutes for older versions)
        var routes = ocelotConfig["Routes"]?.AsArray() ?? ocelotConfig["ReRoutes"]?.AsArray();
        
        if (routes == null || routes.Count == 0)
        {
            result.Errors.Add("No Routes found in configuration");
            return result;
        }

        var serviceMap = new Dictionary<string, string>(); // host:port -> serviceId

        foreach (var routeNode in routes)
        {
            if (routeNode == null) continue;
            
            try
            {
                var route = ParseRoute(routeNode, envId, serviceMap);
                _dataStore.UpsertRoute(route);
                result.RoutesImported++;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Failed to parse route: {ex.Message}");
            }
        }

        result.ServicesCreated = serviceMap.Count;
        return result;
    }

    private string CreateEnvironment(JsonNode config, string name)
    {
        var globalConfig = config["GlobalConfiguration"];
        var baseUrl = globalConfig?["BaseUrl"]?.GetValue<string>() ?? "http://localhost:5000";
        
        var env = new EnvironmentModel
        {
            Name = name,
            BaseUrl = baseUrl,
            DiscoveryProviderType = globalConfig?["ServiceDiscoveryProvider"]?["Type"]?.GetValue<string>()
        };

        var created = _dataStore.UpsertEnvironment(env);
        return created.Id;
    }

    private RouteModel ParseRoute(JsonNode routeNode, string envId, Dictionary<string, string> serviceMap)
    {
        var upstreamPath = routeNode["UpstreamPathTemplate"]?.GetValue<string>() ?? "/";
        var downstreamPath = routeNode["DownstreamPathTemplate"]?.GetValue<string>() ?? "/";
        
        // Parse upstream methods
        var methods = new List<string>();
        var methodsArray = routeNode["UpstreamHttpMethod"]?.AsArray();
        if (methodsArray != null)
        {
            foreach (var m in methodsArray)
            {
                if (m != null) methods.Add(m.GetValue<string>());
            }
        }
        if (methods.Count == 0) methods.Add("GET");

        // Parse downstream host and ports OR ServiceName (for service discovery)
        var hostAndPorts = new List<HostAndPort>();
        var hostsArray = routeNode["DownstreamHostAndPorts"]?.AsArray();
        var serviceName = routeNode["ServiceName"]?.GetValue<string>();
        string? serviceId = null;
        
        if (hostsArray != null && hostsArray.Count > 0)
        {
            foreach (var hp in hostsArray)
            {
                if (hp == null) continue;
                var host = hp["Host"]?.GetValue<string>() ?? "localhost";
                var port = hp["Port"]?.GetValue<int>() ?? 80;
                hostAndPorts.Add(new HostAndPort { Host = host, Port = port });
                
                // Create service for unique host:port combinations
                var key = $"{host}:{port}";
                if (!serviceMap.ContainsKey(key))
                {
                    var service = CreateServiceFromHost(host, port, envId);
                    serviceMap[key] = service.Id;
                }
                serviceId = serviceMap[key];
            }
        }
        else if (!string.IsNullOrEmpty(serviceName))
        {
            // Handle service discovery routes (Consul/Eureka) - no explicit hosts, uses ServiceName
            var key = $"sd:{serviceName}";
            if (!serviceMap.ContainsKey(key))
            {
                var service = CreateServiceFromServiceName(serviceName, envId);
                serviceMap[key] = service.Id;
            }
            serviceId = serviceMap[key];
        }

        // Parse policies
        var policies = new RoutePolicies();
        
        // Auth policy
        var authOptions = routeNode["AuthenticationOptions"];
        if (authOptions != null)
        {
            var authKey = authOptions["AuthenticationProviderKey"]?.GetValue<string>();
            if (!string.IsNullOrEmpty(authKey))
            {
                policies.Auth = new AuthPolicy
                {
                    Scheme = authKey,
                    AllowedScopes = ParseStringArray(authOptions["AllowedScopes"])
                };
            }
        }

        // Rate limit policy
        var rateLimitOptions = routeNode["RateLimitOptions"];
        if (rateLimitOptions != null)
        {
            var enabled = rateLimitOptions["EnableRateLimiting"]?.GetValue<bool>() ?? false;
            if (enabled)
            {
                policies.RateLimit = new RateLimitPolicy
                {
                    EnableRateLimiting = true,
                    Period = rateLimitOptions["Period"]?.GetValue<string>(),
                    Limit = rateLimitOptions["Limit"]?.GetValue<int>() ?? 100
                };
            }
        }

        // Cache policy - support both FileCacheOptions and CacheOptions
        var cacheOptions = routeNode["FileCacheOptions"] ?? routeNode["CacheOptions"];
        if (cacheOptions != null)
        {
            var ttl = cacheOptions["TtlSeconds"]?.GetValue<int>() ?? 0;
            if (ttl > 0)
            {
                policies.Cache = new CachePolicy { TtlSeconds = ttl };
            }
        }

        // Use RouteKey from config if provided, otherwise generate from path
        var routeKey = routeNode["RouteKey"]?.GetValue<string>() ?? GenerateRouteKey(upstreamPath);

        return new RouteModel
        {
            EnvironmentId = envId,
            RouteKey = routeKey,
            Description = $"Imported from Ocelot config",
            IsActive = true,
            UpstreamPathTemplate = upstreamPath,
            UpstreamMethods = methods,
            DownstreamPathTemplate = downstreamPath,
            DownstreamScheme = routeNode["DownstreamScheme"]?.GetValue<string>() ?? "https",
            DownstreamServiceId = serviceId,
            DownstreamHostAndPorts = hostAndPorts.Count > 0 ? hostAndPorts : null,
            Priority = routeNode["Priority"]?.GetValue<int>() ?? 1,
            RequestIdKey = routeNode["RequestIdKey"]?.GetValue<string>(),
            Policies = policies
        };
    }

    private ServiceModel CreateServiceFromHost(string host, int port, string envId)
    {
        var service = new ServiceModel
        {
            EnvironmentId = envId,
            Name = SanitizeServiceName(host),
            DefaultScheme = port == 443 ? "https" : "http",
            Hosts = new List<HostAndPort> { new() { Host = host, Port = port } },
            Tags = new List<string> { "imported" }
        };
        
        return _dataStore.UpsertService(service);
    }

    private ServiceModel CreateServiceFromServiceName(string serviceName, string envId)
    {
        // Create a service for service discovery (Consul/Eureka) - no explicit hosts
        var service = new ServiceModel
        {
            EnvironmentId = envId,
            Name = SanitizeServiceName(serviceName),
            DefaultScheme = "https",
            UseServiceDiscovery = true,
            ServiceDiscoveryName = serviceName,
            Tags = new List<string> { "imported", "service-discovery" }
        };
        
        return _dataStore.UpsertService(service);
    }

    private static string SanitizeServiceName(string host)
    {
        // Convert host to service name: orders-service.local -> Orders Service
        var name = host.Split('.')[0];
        name = name.Replace("-", " ");
        return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(name);
    }

    private static string GenerateRouteKey(string path)
    {
        // /api/orders/{everything} -> api-orders
        var key = path.TrimStart('/').Split('/').Take(2).ToArray();
        return string.Join("-", key).Replace("{", "").Replace("}", "").ToLower();
    }

    private static List<string> ParseStringArray(JsonNode? node)
    {
        var result = new List<string>();
        if (node?.AsArray() is { } arr)
        {
            foreach (var item in arr)
            {
                if (item != null) result.Add(item.GetValue<string>());
            }
        }
        return result;
    }
}

public class ImportResult
{
    public bool EnvironmentCreated { get; set; }
    public string? EnvironmentId { get; set; }
    public int RoutesImported { get; set; }
    public int ServicesCreated { get; set; }
    public List<string> Errors { get; set; } = new();
    public bool Success => Errors.Count == 0;
}
