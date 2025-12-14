using System.Text.Json;
using GateControl.Api.Models;

namespace GateControl.Api.Services;

public class PublisherService
{
    private readonly DataStore _store;
    private readonly ValidationService _validationService;
    private readonly OcelotGenerator _generator;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    public PublisherService(DataStore store, ValidationService validationService, OcelotGenerator generator)
    {
        _store = store;
        _validationService = validationService;
        _generator = generator;
    }

    public PublishRecord Publish(string environmentId, string actor, string? changeRequestId, IEnumerable<string>? targetNodes)
    {
        var record = new PublishRecord
        {
            EnvironmentId = environmentId,
            ChangeRequestId = changeRequestId,
            PublishedBy = actor,
            TargetNodes = targetNodes?.ToList() ?? new List<string>()
        };

        var validation = _validationService.ValidateEnvironment(environmentId);
        record.ValidationIssues = validation.Issues;
        if (!validation.IsValid)
        {
            record.Status = "Failed";
            record.Result = "Validation failed";
            _store.AppendPublishRecord(record);
            _store.AppendAudit(new AuditLogEntry
            {
                Actor = actor,
                Action = "PublishFailed",
                EntityType = "Environment",
                EntityId = environmentId,
                Reason = "Validation failed"
            });
            return record;
        }

        var config = _generator.Build(environmentId);
        var json = JsonSerializer.Serialize(config, _jsonOptions);
        record.ConfigHash = validation.ConfigHash ?? string.Empty;

        var publishFolder = Path.Combine(AppContext.BaseDirectory, "../data/published", environmentId);
        Directory.CreateDirectory(publishFolder);
        var tempPath = Path.Combine(publishFolder, "ocelot.json.tmp");
        var targetPath = Path.Combine(publishFolder, "ocelot.json");
        File.WriteAllText(tempPath, json);
        File.Copy(tempPath, targetPath, overwrite: true);
        File.Delete(tempPath);

        record.Status = "Succeeded";
        record.Result = "Config written and ready for reload";
        _store.AppendPublishRecord(record);
        _store.AppendAudit(new AuditLogEntry
        {
            Actor = actor,
            Action = "Publish",
            EntityType = "Environment",
            EntityId = environmentId,
            Reason = "Manual publish",
            AfterJson = json
        });
        return record;
    }
}
