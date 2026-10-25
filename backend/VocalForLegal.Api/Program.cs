using System.Net;
using System.Net.Mail;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using VocalForLegal.Api.Models;
using VocalForLegal.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddScoped<IEnquiryEmailSender, SmtpEnquiryEmailSender>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"];
        policy.WithOrigins(configuredOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("enquiries", limiter =>
    {
        limiter.PermitLimit = 5;
        limiter.Window = TimeSpan.FromMinutes(10);
        limiter.QueueLimit = 0;
        limiter.AutoReplenishment = true;
    });
});

var app = builder.Build();
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseRateLimiter();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/enquiries", async (
    EnquiryRequest request,
    IEnquiryEmailSender sender,
    ILogger<Program> logger,
    CancellationToken cancellationToken) =>
{
    var errors = Validate(request);
    if (errors.Count > 0)
        return Results.ValidationProblem(errors);

    try
    {
        await sender.SendAsync(request, cancellationToken);
        logger.LogInformation("Enquiry email dispatched for topic {Topic}", request.Topic);
        return Results.Ok(new { message = "Enquiry submitted." });
    }
    catch (EmailNotConfiguredException)
    {
        return Results.Problem(
            title: "Enquiry service is not configured",
            detail: "The website enquiry service is not ready yet. Please contact the advocate through a verified channel.",
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Unable to dispatch enquiry email");
        return Results.Problem(
            title: "Unable to send enquiry",
            detail: "The enquiry could not be sent right now. Please try again later or use a verified contact channel.",
            statusCode: StatusCodes.Status502BadGateway);
    }
})
.RequireRateLimiting("enquiries");

app.Run();

static Dictionary<string, string[]> Validate(EnquiryRequest request)
{
    var errors = new Dictionary<string, string[]>();
    void Add(string key, string message) => errors[key] = [message];

    if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Trim().Length > 100)
        Add(nameof(request.FullName), "Name is required and must be 100 characters or fewer.");
    if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254 ||
        !System.Text.RegularExpressions.Regex.IsMatch(request.Email, @"^[^\s@]+@[^\s@]+\.[^\s@]+$"))
        Add(nameof(request.Email), "Enter a valid email address.");
    if (request.Phone?.Length > 30)
        Add(nameof(request.Phone), "Phone must be 30 characters or fewer.");
    if (string.IsNullOrWhiteSpace(request.Topic) || request.Topic.Length > 100)
        Add(nameof(request.Topic), "Choose an area of interest.");
    if (request.Message?.Length > 2000)
        Add(nameof(request.Message), "Message must be 2,000 characters or fewer.");
    if (!request.Consent)
        Add(nameof(request.Consent), "Acknowledgement is required.");

    return errors;
}
