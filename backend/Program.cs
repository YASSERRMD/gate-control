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

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
