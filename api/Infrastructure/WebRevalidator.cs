using Microsoft.Extensions.Options;

namespace Tobic.Api.Infrastructure;

/// <summary>Tells the Next.js site to drop cached pages after content changes.</summary>
public class WebRevalidator(HttpClient http, IOptions<WebOptions> options, ILogger<WebRevalidator> logger)
{
    private readonly WebOptions _options = options.Value;

    public async Task RevalidateAsync(params string[] tags)
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl) || string.IsNullOrWhiteSpace(_options.RevalidateSecret))
        {
            return;
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl.TrimEnd('/')}/api/revalidate")
            {
                Content = JsonContent.Create(new { tags }),
            };
            request.Headers.Add("x-revalidate-secret", _options.RevalidateSecret);
            using var response = await http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Revalidate {Tags} returned {Status}", tags, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Revalidate {Tags} failed", tags);
        }
    }
}
