using System.Text.Json.Nodes;

namespace GateControl.Api.Models;

public class DataModel
{
    public List<EnvironmentModel> Environments { get; set; } = new();
    public List<ServiceModel> Services { get; set; } = new();
    public List<RouteModel> Routes { get; set; } = new();
    public List<ChangeRequest> ChangeRequests { get; set; } = new();
    public List<PublishRecord> PublishHistory { get; set; } = new();
    public List<AuditLogEntry> AuditLogs { get; set; } = new();
    
    // Advanced Features
    public List<JsonObject> AuthenticationPolicies { get; set; } = new();
    public List<JsonObject> RateLimitPolicies { get; set; } = new();
    public List<JsonObject> CachingPolicies { get; set; } = new();
    public List<JsonObject> QosPolicies { get; set; } = new();
    public List<JsonObject> LoadBalancers { get; set; } = new();
    public List<JsonObject> TestCases { get; set; } = new();
    public List<JsonObject> GatewayHealth { get; set; } = new();
    public JsonObject? Metrics { get; set; }
    public List<JsonObject> Users { get; set; } = new();
    public List<JsonObject> Roles { get; set; } = new();
    public JsonObject? Settings { get; set; }
}
