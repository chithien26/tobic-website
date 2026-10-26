using Microsoft.Extensions.Options;

namespace Tobic.Api.Infrastructure;

public interface IFileStorage
{
    Task<(string Url, string StoragePath)> SaveAsync(Stream content, string extension, CancellationToken ct);
    Task DeleteAsync(string storagePath, CancellationToken ct);
}

/// <summary>Stores uploads on the local disk and serves them as static files.</summary>
public class LocalFileStorage(IOptions<StorageOptions> options, IWebHostEnvironment env) : IFileStorage
{
    private readonly StorageOptions _options = options.Value;

    public string Root => Path.IsPathRooted(_options.UploadRoot)
        ? _options.UploadRoot
        : Path.Combine(env.ContentRootPath, _options.UploadRoot);

    public async Task<(string Url, string StoragePath)> SaveAsync(Stream content, string extension, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var relative = Path.Combine(now.ToString("yyyy"), now.ToString("MM"), $"{Guid.NewGuid():N}{extension}");
        var fullPath = Path.Combine(Root, relative);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using (var file = File.Create(fullPath))
        {
            await content.CopyToAsync(file, ct);
        }

        var storagePath = relative.Replace('\\', '/');
        return ($"{_options.PublicPath.TrimEnd('/')}/{storagePath}", storagePath);
    }

    public Task DeleteAsync(string storagePath, CancellationToken ct)
    {
        var fullPath = Path.GetFullPath(Path.Combine(Root, storagePath));
        if (fullPath.StartsWith(Path.GetFullPath(Root), StringComparison.OrdinalIgnoreCase) && File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        return Task.CompletedTask;
    }
}
