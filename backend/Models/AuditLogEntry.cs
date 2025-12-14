namespace GateControl.Api.Models;

public class AuditLogEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string Actor { get; set; } = "system";
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Reason { get; set; }
    public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
    public string? BeforeJson { get; set; }
    public string? AfterJson { get; set; }
}
