namespace GateControl.Api.Models;

public class PublishRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string EnvironmentId { get; set; } = string.Empty;
    public string? ChangeRequestId { get; set; }
    public string ConfigHash { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";
    public string? PublishedBy { get; set; }
    public List<string> TargetNodes { get; set; } = new();
    public string? Result { get; set; }
    public string? RollbackReference { get; set; }
    public List<ValidationIssue> ValidationIssues { get; set; } = new();
}
