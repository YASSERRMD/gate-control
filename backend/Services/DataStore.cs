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
        _dbPath = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "../data/db.json"));
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
            Persist();
            return model;
        }
    }

    public bool DeleteEnvironment(string id) => DeleteEntity(_data.Environments, id);
    public bool DeleteService(string id) => DeleteEntity(_data.Services, id);
    public bool DeleteRoute(string id) => DeleteEntity(_data.Routes, id);
    public bool DeleteChangeRequest(string id) => DeleteEntity(_data.ChangeRequests, id);

    public EnvironmentModel? GetEnvironment(string id) => _data.Environments.FirstOrDefault(e => e.Id == id);
    public ServiceModel? GetService(string id) => _data.Services.FirstOrDefault(s => s.Id == id);
    public RouteModel? GetRoute(string id) => _data.Routes.FirstOrDefault(r => r.Id == id);
    public ChangeRequest? GetChangeRequest(string id) => _data.ChangeRequests.FirstOrDefault(c => c.Id == id);

    private bool DeleteEntity<T>(ICollection<T> list, string id) where T : class
    {
        lock (_lock)
        {
            var toDelete = list.FirstOrDefault(e => GetId(e) == id);
            if (toDelete is null)
            {
                return false;
            }

            list.Remove(toDelete);
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
