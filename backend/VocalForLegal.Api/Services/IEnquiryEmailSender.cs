using VocalForLegal.Api.Models;

namespace VocalForLegal.Api.Services;

public interface IEnquiryEmailSender
{
    Task SendAsync(EnquiryRequest request, CancellationToken cancellationToken);
}
