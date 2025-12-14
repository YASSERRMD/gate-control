using GateControl.Api.Models;

namespace GateControl.Api.Services;

public class ObservabilityService
{
    private readonly DataStore _store;

    public ObservabilityService(DataStore store)
    {
        _store = store;
    }

    public object Overview()
    {
        return new
        {
            environments = _store.Environments.Count,
            services = _store.Services.Count,
            routes = _store.Routes.Count,
            changeRequests = _store.ChangeRequests.GroupBy(c => c.Status).ToDictionary(g => g.Key, g => g.Count()),
            lastPublishes = _store.PublishHistory
                .OrderByDescending(p => p.PublishedAt)
                .Take(5)
                .Select(p => new { p.EnvironmentId, p.PublishedAt, p.Status, p.ConfigHash })
        };
    }
}
