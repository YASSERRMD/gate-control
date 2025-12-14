namespace GateControl.Api.Models;

public class PublishRequest
{
    public string? Actor { get; set; }
    public string? ChangeRequestId { get; set; }
    public IEnumerable<string>? TargetNodes { get; set; }
}
