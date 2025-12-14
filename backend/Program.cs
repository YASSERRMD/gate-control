using GateControl.Api.Models;
using GateControl.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.WriteIndented = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<DataStore>();
builder.Services.AddSingleton<OcelotGenerator>();
builder.Services.AddSingleton<ValidationService>();
builder.Services.AddSingleton<PublisherService>();
builder.Services.AddSingleton<ObservabilityService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

app.MapGet("/api/environments", (DataStore store) => Results.Ok(store.Environments))
    .WithTags("Environments");

app.MapGet("/api/environments/{id}", (string id, DataStore store) =>
{
    var env = store.GetEnvironment(id);
    return env is null ? Results.NotFound() : Results.Ok(env);
}).WithTags("Environments");

app.MapPost("/api/environments", (EnvironmentModel model, DataStore store) => Results.Ok(store.UpsertEnvironment(model)))
    .WithTags("Environments");

app.MapPut("/api/environments/{id}", (string id, EnvironmentModel model, DataStore store) =>
{
    model.Id = id;
    return Results.Ok(store.UpsertEnvironment(model));
}).WithTags("Environments");

app.MapDelete("/api/environments/{id}", (string id, DataStore store) =>
{
    return store.DeleteEnvironment(id) ? Results.NoContent() : Results.NotFound();
}).WithTags("Environments");

app.MapGet("/api/services", (DataStore store) => Results.Ok(store.Services))
    .WithTags("Services");

app.MapGet("/api/services/{id}", (string id, DataStore store) =>
{
    var service = store.GetService(id);
    return service is null ? Results.NotFound() : Results.Ok(service);
}).WithTags("Services");

app.MapPost("/api/services", (ServiceModel model, DataStore store) => Results.Ok(store.UpsertService(model)))
    .WithTags("Services");

app.MapPut("/api/services/{id}", (string id, ServiceModel model, DataStore store) =>
{
    model.Id = id;
    return Results.Ok(store.UpsertService(model));
}).WithTags("Services");

app.MapDelete("/api/services/{id}", (string id, DataStore store) =>
{
    return store.DeleteService(id) ? Results.NoContent() : Results.NotFound();
}).WithTags("Services");

app.MapGet("/api/routes", (DataStore store) => Results.Ok(store.Routes))
    .WithTags("Routes");

app.MapGet("/api/routes/{id}", (string id, DataStore store) =>
{
    var route = store.GetRoute(id);
    return route is null ? Results.NotFound() : Results.Ok(route);
}).WithTags("Routes");

app.MapPost("/api/routes", (RouteModel model, DataStore store) => Results.Ok(store.UpsertRoute(model)))
    .WithTags("Routes");

app.MapPut("/api/routes/{id}", (string id, RouteModel model, DataStore store) =>
{
    model.Id = id;
    return Results.Ok(store.UpsertRoute(model));
}).WithTags("Routes");

app.MapDelete("/api/routes/{id}", (string id, DataStore store) =>
{
    return store.DeleteRoute(id) ? Results.NoContent() : Results.NotFound();
}).WithTags("Routes");

app.MapGet("/api/change-requests", (DataStore store) => Results.Ok(store.ChangeRequests))
    .WithTags("Change Requests");

app.MapGet("/api/change-requests/{id}", (string id, DataStore store) =>
{
    var change = store.GetChangeRequest(id);
    return change is null ? Results.NotFound() : Results.Ok(change);
}).WithTags("Change Requests");

app.MapPost("/api/change-requests", (ChangeRequest model, DataStore store) => Results.Ok(store.UpsertChangeRequest(model)))
    .WithTags("Change Requests");

app.MapPut("/api/change-requests/{id}", (string id, ChangeRequest model, DataStore store) =>
{
    model.Id = id;
    return Results.Ok(store.UpsertChangeRequest(model));
}).WithTags("Change Requests");

app.MapPut("/api/change-requests/{id}/status", (string id, StatusChangeRequest request, DataStore store) =>
{
    var updated = store.UpdateChangeRequestStatus(id, request.Status, request.Actor ?? "system", request.Reason);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
}).WithTags("Change Requests");

app.MapDelete("/api/change-requests/{id}", (string id, DataStore store) =>
{
    return store.DeleteChangeRequest(id) ? Results.NoContent() : Results.NotFound();
}).WithTags("Change Requests");

app.MapGet("/api/environments/{environmentId}/ocelot", (string environmentId, OcelotGenerator generator) =>
{
    try
    {
        var config = generator.Build(environmentId);
        return Results.Ok(config);
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
}).WithTags("Config");

app.MapGet("/api/environments/{environmentId}/validate", (string environmentId, ValidationService validator) =>
{
    var report = validator.ValidateEnvironment(environmentId);
    return Results.Ok(report);
}).WithTags("Config");

app.MapPost("/api/environments/{environmentId}/publish", (string environmentId, PublishRequest publishRequest, PublisherService publisher) =>
{
    var record = publisher.Publish(environmentId, publishRequest.Actor ?? "publisher", publishRequest.ChangeRequestId, publishRequest.TargetNodes);
    return Results.Ok(record);
}).WithTags("Publishing");

app.MapGet("/api/environments/{environmentId}/publish-history", (string environmentId, DataStore store) =>
{
    var history = store.PublishHistory.Where(p => p.EnvironmentId == environmentId).OrderByDescending(p => p.PublishedAt);
    return Results.Ok(history);
}).WithTags("Publishing");

app.MapGet("/api/audit-logs", (DataStore store) => Results.Ok(store.AuditLogs.OrderByDescending(a => a.Timestamp)))
    .WithTags("Audit");

app.MapGet("/api/observability/overview", (ObservabilityService observability) => Results.Ok(observability.Overview()))
    .WithTags("Observability");

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
