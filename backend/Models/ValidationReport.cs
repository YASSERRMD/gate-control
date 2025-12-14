namespace GateControl.Api.Models;

public class ValidationReport
{
    public List<ValidationIssue> Issues { get; set; } = new();
    public string? ConfigHash { get; set; }

    public bool IsValid => Issues.All(i => !string.Equals(i.Severity, "Error", StringComparison.OrdinalIgnoreCase));
}
