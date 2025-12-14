using GateControl.Api.Models;

namespace GateControl.Api.Services;

public class OcelotGenerator
{
    private readonly DataStore _store;

    public OcelotGenerator(DataStore store)
    {
        _store = store;
    }

    public OcelotConfig Build(string environmentId)
    {
        var environment = _store.GetEnvironment(environmentId) ?? throw new InvalidOperationException($"Environment '{environmentId}' not found.");
        var routes = _store.Routes.Where(r => r.EnvironmentId == environmentId && r.IsActive).ToList();
        var services = _store.Services.Where(s => s.EnvironmentId == environmentId).ToList();

        var ocelotRoutes = new List<OcelotRoute>();
        foreach (var route in routes)
        {
            var downstreamHostAndPorts = route.DownstreamHostAndPorts ??
                services.FirstOrDefault(s => s.Id == route.DownstreamServiceId)?.Hosts ?? new List<HostAndPort>();

            ocelotRoutes.Add(new OcelotRoute
            {
                DownstreamPathTemplate = route.DownstreamPathTemplate,
                DownstreamScheme = route.DownstreamScheme,
                DownstreamHostAndPorts = downstreamHostAndPorts
                    .Select(h => new DownstreamHostAndPort { Host = h.Host, Port = h.Port })
                    .ToList(),
                UpstreamPathTemplate = route.UpstreamPathTemplate,
                UpstreamHttpMethod = route.UpstreamMethods,
                Priority = route.Priority,
                RequestIdKey = route.RequestIdKey,
                AuthenticationOptions = route.Policies.Auth is null
                    ? null
                    : new AuthenticationOptions
                    {
                        AuthenticationProviderKey = route.Policies.Auth.Scheme,
                        AllowedScopes = route.Policies.Auth.AllowedScopes
                    },
                RateLimitOptions = route.Policies.RateLimit is null
                    ? null
                    : new RateLimitOptions
                    {
                        EnableRateLimiting = route.Policies.RateLimit.EnableRateLimiting,
                        Limit = route.Policies.RateLimit.Limit,
                        Period = route.Policies.RateLimit.Period
                    },
                CacheOptions = route.Policies.Cache is null
                    ? null
                    : new CacheOptions
                    {
                        TtlSeconds = route.Policies.Cache.TtlSeconds
                    }
            });
        }

        return new OcelotConfig
        {
            Routes = ocelotRoutes,
            GlobalConfiguration = new GlobalConfiguration
            {
                BaseUrl = environment.BaseUrl,
                RequestIdKey = "X-Correlation-ID"
            }
        };
    }
}

public class OcelotConfig
{
    public List<OcelotRoute> Routes { get; set; } = new();
    public GlobalConfiguration GlobalConfiguration { get; set; } = new();
}

public class OcelotRoute
{
    public string DownstreamPathTemplate { get; set; } = string.Empty;
    public string DownstreamScheme { get; set; } = "https";
    public List<DownstreamHostAndPort> DownstreamHostAndPorts { get; set; } = new();
    public string UpstreamPathTemplate { get; set; } = string.Empty;
    public List<string> UpstreamHttpMethod { get; set; } = new();
    public int Priority { get; set; }
    public string? RequestIdKey { get; set; }
    public AuthenticationOptions? AuthenticationOptions { get; set; }
    public RateLimitOptions? RateLimitOptions { get; set; }
    public CacheOptions? CacheOptions { get; set; }
}

public class DownstreamHostAndPort
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
}

public class AuthenticationOptions
{
    public string AuthenticationProviderKey { get; set; } = string.Empty;
    public List<string> AllowedScopes { get; set; } = new();
}

public class RateLimitOptions
{
    public bool EnableRateLimiting { get; set; }
    public string? Period { get; set; }
    public int Limit { get; set; }
}

public class CacheOptions
{
    public int TtlSeconds { get; set; }
}

public class GlobalConfiguration
{
    public string BaseUrl { get; set; } = string.Empty;
    public string RequestIdKey { get; set; } = "X-Correlation-ID";
}
