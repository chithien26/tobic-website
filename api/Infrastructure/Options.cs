namespace Tobic.Api.Infrastructure;

public class JwtOptions
{
    public string Issuer { get; set; } = "tobic-api";
    public string Audience { get; set; } = "tobic-admin";
    public string Key { get; set; } = string.Empty;
    public int ExpiresMinutes { get; set; } = 480;
}

public class WebOptions
{
    /// <summary>Base URL of the Next.js site, used for on-demand revalidation.</summary>
    public string BaseUrl { get; set; } = string.Empty;
    public string RevalidateSecret { get; set; } = string.Empty;
}

public class StorageOptions
{
    /// <summary>Folder (relative to content root or absolute) where uploads are written.</summary>
    public string UploadRoot { get; set; } = "wwwroot/uploads";
    public string PublicPath { get; set; } = "/uploads";
    public long MaxUploadBytes { get; set; } = 200L * 1024 * 1024;
}

public class SeedOptions
{
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminPassword { get; set; } = string.Empty;
    public string LegacyDataFile { get; set; } = "SeedData/legacy.json";
}
