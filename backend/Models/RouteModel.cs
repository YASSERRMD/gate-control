namespace GateControl.Api.Models;

public class RouteModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string EnvironmentId { get; set; } = string.Empty;
    public string RouteKey { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string UpstreamPathTemplate { get; set; } = string.Empty;
    public List<string> UpstreamMethods { get; set; } = new();
    public string DownstreamPathTemplate { get; set; } = string.Empty;
    public string DownstreamScheme { get; set; } = "https";
    public string? DownstreamServiceId { get; set; }
    public List<HostAndPort>? DownstreamHostAndPorts { get; set; }
    public int Priority { get; set; } = 1;
    public string? RequestIdKey { get; set; }
    public RoutePolicies Policies { get; set; } = new();
}

public class RoutePolicies
{
    public AuthPolicy? Auth { get; set; }
    public RateLimitPolicy? RateLimit { get; set; }
    public CachePolicy? Cache { get; set; }
}

public class AuthPolicy
{
    public string Scheme { get; set; } = "oidc";
    public List<string> AllowedScopes { get; set; } = new();
}

public class RateLimitPolicy
{
    public bool EnableRateLimiting { get; set; }
    public string? Period { get; set; }
    public int Limit { get; set; }
}

public class CachePolicy
{
    public int TtlSeconds { get; set; }
}
