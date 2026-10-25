using System.Net;
using System.Net.Mail;
using System.Text;
using VocalForLegal.Api.Models;

namespace VocalForLegal.Api.Services;

public sealed class SmtpEnquiryEmailSender(IConfiguration configuration) : IEnquiryEmailSender
{
    public async Task SendAsync(EnquiryRequest request, CancellationToken cancellationToken)
    {
        var host = configuration["Smtp:Host"];
        var fromEmail = configuration["Smtp:FromEmail"];
        var toEmail = configuration["Enquiries:ToEmail"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(fromEmail) || string.IsNullOrWhiteSpace(toEmail))
            throw new EmailNotConfiguredException();

        var port = int.TryParse(configuration["Smtp:Port"], out var parsedPort) ? parsedPort : 587;
        var enableSsl = !bool.TryParse(configuration["Smtp:EnableSsl"], out var ssl) || ssl;
        using var message = new MailMessage
        {
            From = new MailAddress(fromEmail, "Vocal for Legal website"),
            Subject = $"Website enquiry: {CleanHeader(request.Topic)}",
            Body = BuildBody(request),
            IsBodyHtml = false,
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8
        };
        message.To.Add(new MailAddress(toEmail));
        message.ReplyToList.Add(new MailAddress(request.Email, CleanHeader(request.FullName)));

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 15000
        };

        var user = configuration["Smtp:User"];
        var password = configuration["Smtp:Password"];
        if (!string.IsNullOrWhiteSpace(user))
            client.Credentials = new NetworkCredential(user, password ?? string.Empty);
        else
            client.UseDefaultCredentials = true;

        cancellationToken.ThrowIfCancellationRequested();
        await client.SendMailAsync(message, cancellationToken);
    }

    private static string BuildBody(EnquiryRequest request) =>
        $"New enquiry submitted through the Vocal for Legal website.{Environment.NewLine}{Environment.NewLine}" +
        $"Name: {request.FullName}{Environment.NewLine}" +
        $"Email: {request.Email}{Environment.NewLine}" +
        $"Phone: {request.Phone ?? "(not provided)"}{Environment.NewLine}" +
        $"Topic: {request.Topic}{Environment.NewLine}{Environment.NewLine}" +
        $"Message:{Environment.NewLine}{request.Message ?? "(not provided)"}{Environment.NewLine}{Environment.NewLine}" +
        "This is an initial enquiry only. It does not establish an advocate–client relationship.";

    private static string CleanHeader(string value) => value.Replace("\r", " ").Replace("\n", " ").Trim();
}

public sealed class EmailNotConfiguredException : Exception { }
