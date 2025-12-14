using System.Text.Json.Nodes;
using GateControl.Api.Models;
using GateControl.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.WriteIndented = true;
});

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<DataStore>();
builder.Services.AddSingleton<OcelotGenerator>();
builder.Services.AddSingleton<ValidationService>();
builder.Services.AddSingleton<PublisherService>();
builder.Services.AddSingleton<ObservabilityService>();

var app = builder.Build();

// Use CORS
app.UseCors("AllowFrontend");

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

// Advanced Features Endpoints
app.MapGet("/api/authenticationPolicies", (DataStore store) => Results.Ok(store.AuthenticationPolicies))
    .WithTags("Policies");

app.MapPost("/api/authenticationPolicies", async (HttpContext ctx, DataStore store) => {
    var policy = await ctx.Request.ReadFromJsonAsync<JsonObject>();
    if (policy == null) return Results.BadRequest();
    var created = store.AddAuthenticationPolicy(policy);
    return Results.Created($"/api/authenticationPolicies/{created["id"]}", created);
}).WithTags("Policies");

app.MapGet("/api/rateLimitPolicies", (DataStore store) => Results.Ok(store.RateLimitPolicies))
    .WithTags("Policies");

app.MapPost("/api/rateLimitPolicies", async (HttpContext ctx, DataStore store) => {
    var policy = await ctx.Request.ReadFromJsonAsync<JsonObject>();
    if (policy == null) return Results.BadRequest();
    var created = store.AddRateLimitPolicy(policy);
    return Results.Created($"/api/rateLimitPolicies/{created["id"]}", created);
}).WithTags("Policies");

app.MapGet("/api/cachingPolicies", (DataStore store) => Results.Ok(store.CachingPolicies))
    .WithTags("Policies");

app.MapPost("/api/cachingPolicies", async (HttpContext ctx, DataStore store) => {
    var policy = await ctx.Request.ReadFromJsonAsync<JsonObject>();
    if (policy == null) return Results.BadRequest();
    var created = store.AddCachingPolicy(policy);
    return Results.Created($"/api/cachingPolicies/{created["id"]}", created);
}).WithTags("Policies");

app.MapGet("/api/qosPolicies", (DataStore store) => Results.Ok(store.QosPolicies))
    .WithTags("Policies");

app.MapPost("/api/qosPolicies", async (HttpContext ctx, DataStore store) => {
    var policy = await ctx.Request.ReadFromJsonAsync<JsonObject>();
    if (policy == null) return Results.BadRequest();
    var created = store.AddQosPolicy(policy);
    return Results.Created($"/api/qosPolicies/{created["id"]}", created);
}).WithTags("Policies");

app.MapGet("/api/loadBalancers", (DataStore store) => Results.Ok(store.LoadBalancers))
    .WithTags("Load Balancing");

app.MapPost("/api/loadBalancers", async (HttpContext ctx, DataStore store) => {
    var lb = await ctx.Request.ReadFromJsonAsync<JsonObject>();
    if (lb == null) return Results.BadRequest();
    var created = store.AddLoadBalancer(lb);
    return Results.Created($"/api/loadBalancers/{created["id"]}", created);
}).WithTags("Load Balancing");

app.MapGet("/api/testCases", (DataStore store) => Results.Ok(store.TestCases))
    .WithTags("Testing");

app.MapGet("/api/gatewayHealth", (DataStore store) => Results.Ok(store.GatewayHealth))
    .WithTags("Operations");

app.MapGet("/api/metrics", (DataStore store) => Results.Ok(store.Metrics))
    .WithTags("Operations");

app.MapGet("/api/users", (DataStore store) => Results.Ok(store.Users))
    .WithTags("Administration");

app.MapPost("/api/users", async (HttpContext ctx, DataStore store) => {
    var user = await ctx.Request.ReadFromJsonAsync<JsonObject>();
    if (user == null) return Results.BadRequest();
    var created = store.AddUser(user);
    return Results.Created($"/api/users/{created["id"]}", created);
}).WithTags("Administration");

app.MapGet("/api/roles", (DataStore store) => Results.Ok(store.Roles))
    .WithTags("Administration");

app.MapPost("/api/roles", async (HttpContext ctx, DataStore store) => {
    var role = await ctx.Request.ReadFromJsonAsync<JsonObject>();
    if (role == null) return Results.BadRequest();
    var created = store.AddRole(role);
    return Results.Created($"/api/roles/{created["id"]}", created);
}).WithTags("Administration");

app.MapGet("/api/settings", (DataStore store) => Results.Ok(store.Settings))
    .WithTags("Administration");

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
