using System.Text.Json;
using System.Text.Json.Nodes;
using GateControl.Api.Models;

namespace GateControl.Api.Services;

public class DataStore
{
    private readonly string _dbPath;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true
    };
    private readonly object _lock = new();
    private DataModel _data = new();

    public DataStore(IHostEnvironment environment)
    {
        // Use /app/data/db.json in Docker, or ../data/db.json locally
        var dataPath = Path.Combine(environment.ContentRootPath, "data", "db.json");
        if (!File.Exists(dataPath))
        {
            // Fallback to parent directory for local development
            dataPath = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "../data/db.json"));
        }
        
        _dbPath = dataPath;
        Directory.CreateDirectory(Path.GetDirectoryName(_dbPath)!);
        
        if (File.Exists(_dbPath))
        {
            var text = File.ReadAllText(_dbPath);
            _data = JsonSerializer.Deserialize<DataModel>(text, _jsonOptions) ?? new DataModel();
        }
        else
        {
            Persist();
        }
    }

    public IReadOnlyCollection<EnvironmentModel> Environments => _data.Environments;
    public IReadOnlyCollection<ServiceModel> Services => _data.Services;
    public IReadOnlyCollection<RouteModel> Routes => _data.Routes;
    public IReadOnlyCollection<ChangeRequest> ChangeRequests => _data.ChangeRequests;
    public IReadOnlyCollection<PublishRecord> PublishHistory => _data.PublishHistory;
    public IReadOnlyCollection<AuditLogEntry> AuditLogs => _data.AuditLogs;
    
    // Advanced Features
    public IReadOnlyCollection<JsonObject> AuthenticationPolicies => _data.AuthenticationPolicies;
    public IReadOnlyCollection<JsonObject> RateLimitPolicies => _data.RateLimitPolicies;
    public IReadOnlyCollection<JsonObject> CachingPolicies => _data.CachingPolicies;
    public IReadOnlyCollection<JsonObject> QosPolicies => _data.QosPolicies;
    public IReadOnlyCollection<JsonObject> LoadBalancers => _data.LoadBalancers;
    public IReadOnlyCollection<JsonObject> TestCases => _data.TestCases;
    public IReadOnlyCollection<JsonObject> GatewayHealth => _data.GatewayHealth;
    public JsonObject? Metrics => _data.Metrics;
    public IReadOnlyCollection<JsonObject> Users => _data.Users;
    public IReadOnlyCollection<JsonObject> Roles => _data.Roles;
    public JsonObject? Settings => _data.Settings;


    public EnvironmentModel UpsertEnvironment(EnvironmentModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        lock (_lock)
        {
            var existing = _data.Environments.FirstOrDefault(e => e.Id == model.Id);
            if (existing is null)
            {
                if (string.IsNullOrWhiteSpace(model.Id))
                {
                    model.Id = Guid.NewGuid().ToString("n");
                }
                _data.Environments.Add(model);
            }
            else
            {
                existing.Name = model.Name;
                existing.BaseUrl = model.BaseUrl;
                existing.DiscoveryProviderType = model.DiscoveryProviderType;
                existing.SettingsJson = model.SettingsJson ?? new JsonObject();
            }
            AppendAudit(new AuditLogEntry
            {
                Action = existing is null ? "EnvironmentCreated" : "EnvironmentUpdated",
                EntityType = "Environment",
                EntityId = model.Id,
                AfterJson = JsonSerializer.Serialize(model, _jsonOptions)
            });
            Persist();
            return model;
        }
    }

    public ServiceModel UpsertService(ServiceModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        lock (_lock)
        {
            var existing = _data.Services.FirstOrDefault(s => s.Id == model.Id);
            if (existing is null)
            {
                if (string.IsNullOrWhiteSpace(model.Id))
                {
                    model.Id = Guid.NewGuid().ToString("n");
                }
                _data.Services.Add(model);
            }
            else
            {
                existing.EnvironmentId = model.EnvironmentId;
                existing.Name = model.Name;
                existing.DefaultScheme = model.DefaultScheme;
                existing.Hosts = model.Hosts;
                existing.Tags = model.Tags;
                existing.HealthEndpoint = model.HealthEndpoint;
            }
            AppendAudit(new AuditLogEntry
            {
                Action = existing is null ? "ServiceCreated" : "ServiceUpdated",
                EntityType = "Service",
                EntityId = model.Id,
                AfterJson = JsonSerializer.Serialize(model, _jsonOptions)
            });
            Persist();
            return model;
        }
    }

    public RouteModel UpsertRoute(RouteModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        lock (_lock)
        {
            var existing = _data.Routes.FirstOrDefault(r => r.Id == model.Id);
            if (existing is null)
            {
                if (string.IsNullOrWhiteSpace(model.Id))
                {
                    model.Id = Guid.NewGuid().ToString("n");
                }
                _data.Routes.Add(model);
            }
            else
            {
                existing.EnvironmentId = model.EnvironmentId;
                existing.RouteKey = model.RouteKey;
                existing.Description = model.Description;
                existing.IsActive = model.IsActive;
                existing.UpstreamPathTemplate = model.UpstreamPathTemplate;
                existing.UpstreamMethods = model.UpstreamMethods;
                existing.DownstreamPathTemplate = model.DownstreamPathTemplate;
                existing.DownstreamScheme = model.DownstreamScheme;
                existing.DownstreamServiceId = model.DownstreamServiceId;
                existing.DownstreamHostAndPorts = model.DownstreamHostAndPorts;
                existing.Priority = model.Priority;
                existing.RequestIdKey = model.RequestIdKey;
                existing.Policies = model.Policies ?? new RoutePolicies();
            }
            AppendAudit(new AuditLogEntry
            {
                Action = existing is null ? "RouteCreated" : "RouteUpdated",
                EntityType = "Route",
                EntityId = model.Id,
                AfterJson = JsonSerializer.Serialize(model, _jsonOptions)
            });
            Persist();
            return model;
        }
    }

    public ChangeRequest UpsertChangeRequest(ChangeRequest model)
    {
        ArgumentNullException.ThrowIfNull(model);
        lock (_lock)
        {
            var existing = _data.ChangeRequests.FirstOrDefault(r => r.Id == model.Id);
            if (existing is null)
            {
                if (string.IsNullOrWhiteSpace(model.Id))
                {
                    model.Id = Guid.NewGuid().ToString("n");
                }
                _data.ChangeRequests.Add(model);
            }
            else
            {
                existing.EnvironmentId = model.EnvironmentId;
                existing.Title = model.Title;
                existing.Description = model.Description;
                existing.Status = model.Status;
                existing.CreatedBy = model.CreatedBy;
                existing.CreatedAt = model.CreatedAt;
                existing.ApprovedBy = model.ApprovedBy;
                existing.ApprovedAt = model.ApprovedAt;
                existing.PublishedBy = model.PublishedBy;
                existing.PublishedAt = model.PublishedAt;
                existing.RiskLevel = model.RiskLevel;
                existing.RollbackPlan = model.RollbackPlan;
                existing.Justification = model.Justification;
                existing.Items = model.Items;
            }
            AppendAudit(new AuditLogEntry
            {
                Action = existing is null ? "ChangeRequestCreated" : "ChangeRequestUpdated",
                EntityType = "ChangeRequest",
                EntityId = model.Id,
                AfterJson = JsonSerializer.Serialize(model, _jsonOptions)
            });
            Persist();
            return model;
        }
    }

    public bool DeleteEnvironment(string id) => DeleteEntity(_data.Environments, id, "Environment");
    public bool DeleteService(string id) => DeleteEntity(_data.Services, id, "Service");
    public bool DeleteRoute(string id) => DeleteEntity(_data.Routes, id, "Route");
    public bool DeleteChangeRequest(string id) => DeleteEntity(_data.ChangeRequests, id, "ChangeRequest");

    public EnvironmentModel? GetEnvironment(string id) => _data.Environments.FirstOrDefault(e => e.Id == id);
    public ServiceModel? GetService(string id) => _data.Services.FirstOrDefault(s => s.Id == id);
    public RouteModel? GetRoute(string id) => _data.Routes.FirstOrDefault(r => r.Id == id);
    public ChangeRequest? GetChangeRequest(string id) => _data.ChangeRequests.FirstOrDefault(c => c.Id == id);

    public ChangeRequest? UpdateChangeRequestStatus(string id, string status, string actor, string? reason)
    {
        lock (_lock)
        {
            var existing = _data.ChangeRequests.FirstOrDefault(c => c.Id == id);
            if (existing is null)
            {
                return null;
            }

            existing.Status = status;
            if (string.Equals(status, "InReview", StringComparison.OrdinalIgnoreCase))
            {
                existing.ApprovedBy = null;
                existing.ApprovedAt = null;
            }

            if (string.Equals(status, "Approved", StringComparison.OrdinalIgnoreCase))
            {
                existing.ApprovedBy = actor;
                existing.ApprovedAt = DateTime.UtcNow;
            }

            if (string.Equals(status, "Published", StringComparison.OrdinalIgnoreCase))
            {
                existing.PublishedBy = actor;
                existing.PublishedAt = DateTime.UtcNow;
            }

            AppendAudit(new AuditLogEntry
            {
                Actor = actor,
                Action = "ChangeRequestStatus",
                EntityType = "ChangeRequest",
                EntityId = id,
                Reason = reason,
                AfterJson = JsonSerializer.Serialize(existing, _jsonOptions)
            });

            Persist();
            return existing;
        }
    }

    public void AppendPublishRecord(PublishRecord record)
    {
        lock (_lock)
        {
            _data.PublishHistory.Add(record);
            Persist();
        }
    }

    public void AppendAudit(AuditLogEntry entry)
    {
        lock (_lock)
        {
            _data.AuditLogs.Add(entry);
            Persist();
        }
    }

    private bool DeleteEntity<T>(ICollection<T> list, string id, string entityType) where T : class
    {
        lock (_lock)
        {
            var toDelete = list.FirstOrDefault(e => GetId(e) == id);
            if (toDelete is null)
            {
                return false;
            }

            list.Remove(toDelete);
            AppendAudit(new AuditLogEntry
            {
                Action = "Delete",
                EntityType = entityType,
                EntityId = id,
                BeforeJson = JsonSerializer.Serialize(toDelete, _jsonOptions)
            });
            Persist();
            return true;
        }
    }

    private static string? GetId<T>(T obj)
    {
        return obj?.GetType().GetProperty("Id")?.GetValue(obj)?.ToString();
    }

    private void Persist()
    {
        var json = JsonSerializer.Serialize(_data, _jsonOptions);
        File.WriteAllText(_dbPath, json);
    }
}
