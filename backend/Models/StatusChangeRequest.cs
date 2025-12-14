namespace GateControl.Api.Models;

public class StatusChangeRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Actor { get; set; }
    public string? Reason { get; set; }
}
