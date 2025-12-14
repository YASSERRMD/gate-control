using System.Text.Json.Nodes;

namespace GateControl.Api.Models;

public class ChangeRequest
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string EnvironmentId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? PublishedBy { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string? RiskLevel { get; set; }
    public string? RollbackPlan { get; set; }
    public string? Justification { get; set; }
    public List<ChangeRequestItem> Items { get; set; } = new();
}

public class ChangeRequestItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public JsonObject? BeforeJson { get; set; }
    public JsonObject? AfterJson { get; set; }
}
