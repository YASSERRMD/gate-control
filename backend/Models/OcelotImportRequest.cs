using System.Text.Json.Nodes;

namespace GateControl.Api.Models;

public class OcelotImportRequest
{
    public JsonNode? Config { get; set; }
    public string? EnvironmentName { get; set; }
}
