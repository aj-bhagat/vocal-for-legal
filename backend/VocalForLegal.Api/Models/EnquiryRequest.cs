namespace VocalForLegal.Api.Models;

public sealed record EnquiryRequest(
    string FullName,
    string Email,
    string? Phone,
    string Topic,
    string? Message,
    bool Consent);
