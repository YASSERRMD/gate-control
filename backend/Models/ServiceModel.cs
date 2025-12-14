using System.Text.Json.Serialization;

namespace GateControl.Api.Models;

public class HostAndPort
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
}

public class ServiceModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string EnvironmentId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DefaultScheme { get; set; } = "https";
    public List<HostAndPort> Hosts { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public string? HealthEndpoint { get; set; }
    // Service discovery support (Consul/Eureka)
    public bool UseServiceDiscovery { get; set; }
    public string? ServiceDiscoveryName { get; set; }
}
