namespace GateControl.Api.Models;

public class ValidationIssue
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = "Error";
    public string? RouteId { get; set; }
    public string? Field { get; set; }
}
