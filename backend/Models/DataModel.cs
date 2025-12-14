namespace GateControl.Api.Models;

public class DataModel
{
    public List<EnvironmentModel> Environments { get; set; } = new();
    public List<ServiceModel> Services { get; set; } = new();
    public List<RouteModel> Routes { get; set; } = new();
    public List<ChangeRequest> ChangeRequests { get; set; } = new();
    public List<PublishRecord> PublishHistory { get; set; } = new();
    public List<AuditLogEntry> AuditLogs { get; set; } = new();
}
