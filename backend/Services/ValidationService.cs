using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using GateControl.Api.Models;

namespace GateControl.Api.Services;

public class ValidationService
{
    private readonly DataStore _store;
    private readonly OcelotGenerator _generator;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    public ValidationService(DataStore store, OcelotGenerator generator)
    {
        _store = store;
        _generator = generator;
    }

    public ValidationReport ValidateEnvironment(string environmentId)
    {
        var report = new ValidationReport();
        var environment = _store.GetEnvironment(environmentId);
        if (environment is null)
        {
            report.Issues.Add(new ValidationIssue
            {
                Code = "ENVIRONMENT_NOT_FOUND",
                Message = "Environment not found",
                Severity = "Error"
            });
            return report;
        }

        var services = _store.Services.Where(s => s.EnvironmentId == environmentId).ToList();
        var routes = _store.Routes.Where(r => r.EnvironmentId == environmentId).ToList();

        var duplicateGroups = routes
            .SelectMany(r => r.UpstreamMethods.DefaultIfEmpty("ANY"), (route, method) => new { route, method = method ?? "ANY" })
            .GroupBy(x => new { x.route.UpstreamPathTemplate, Method = x.method }, StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1);

        foreach (var dup in duplicateGroups)
        {
            foreach (var route in dup)
            {
                report.Issues.Add(new ValidationIssue
                {
                    Code = "DUPLICATE_ROUTE",
                    Message = $"Duplicate upstream {dup.Key.Method} {dup.Key.UpstreamPathTemplate}",
                    RouteId = route.route.Id,
                    Field = "UpstreamPathTemplate",
                    Severity = "Error"
                });
            }
        }

        foreach (var route in routes)
        {
            if (string.IsNullOrWhiteSpace(route.UpstreamPathTemplate))
            {
                report.Issues.Add(new ValidationIssue
                {
                    Code = "UPSTREAM_REQUIRED",
                    Message = "UpstreamPathTemplate is required",
                    RouteId = route.Id,
                    Field = "UpstreamPathTemplate"
                });
            }

            if (string.IsNullOrWhiteSpace(route.DownstreamPathTemplate))
            {
                report.Issues.Add(new ValidationIssue
                {
                    Code = "DOWNSTREAM_REQUIRED",
                    Message = "DownstreamPathTemplate is required",
                    RouteId = route.Id,
                    Field = "DownstreamPathTemplate"
                });
            }

            if (string.IsNullOrWhiteSpace(route.DownstreamServiceId) && (route.DownstreamHostAndPorts is null || route.DownstreamHostAndPorts.Count == 0))
            {
                report.Issues.Add(new ValidationIssue
                {
                    Code = "DOWNSTREAM_TARGET_MISSING",
                    Message = "Specify either DownstreamServiceId or DownstreamHostAndPorts",
                    RouteId = route.Id,
                    Field = "DownstreamServiceId"
                });
            }

            if (!string.IsNullOrWhiteSpace(route.DownstreamServiceId) && !services.Any(s => s.Id == route.DownstreamServiceId))
            {
                report.Issues.Add(new ValidationIssue
                {
                    Code = "SERVICE_NOT_FOUND",
                    Message = $"Route references missing service {route.DownstreamServiceId}",
                    RouteId = route.Id,
                    Field = "DownstreamServiceId"
                });
            }

            if (route.UpstreamPathTemplate.Contains("**"))
            {
                report.Issues.Add(new ValidationIssue
                {
                    Code = "WILDCARD_PATH",
                    Message = "Wildcard upstream path detected; requires explicit approval",
                    RouteId = route.Id,
                    Field = "UpstreamPathTemplate",
                    Severity = "Warning"
                });
            }
        }

        var config = _generator.Build(environmentId);
        var json = JsonSerializer.Serialize(config, _jsonOptions);
        using var sha = SHA256.Create();
        var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(json));
        report.ConfigHash = Convert.ToHexString(hashBytes);
        return report;
    }
}
