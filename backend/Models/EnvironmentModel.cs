using System.Text.Json.Nodes;

namespace GateControl.Api.Models;

public class EnvironmentModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string Name { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string DiscoveryProviderType { get; set; } = "static";
    public JsonObject SettingsJson { get; set; } = new();
}
