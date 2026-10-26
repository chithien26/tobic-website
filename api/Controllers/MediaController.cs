using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tobic.Api.Data;
using Tobic.Api.Domain;
using Tobic.Api.Infrastructure;

namespace Tobic.Api.Controllers;

[ApiController]
[Route("api/admin/media")]
[Authorize(Policy = Policies.Content)]
public class MediaController(AppDbContext db, IFileStorage storage) : ControllerBase
{
    private static readonly Dictionary<string, string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
        [".webp"] = "image/webp",
        [".gif"] = "image/gif",
        [".avif"] = "image/avif",
        [".mp4"] = "video/mp4",
        [".webm"] = "video/webm",
        [".pdf"] = "application/pdf",
    };

    [HttpGet]
    public async Task<List<MediaFile>> GetAll([FromQuery] string? type, CancellationToken ct)
    {
        var query = db.MediaFiles.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(type)) query = query.Where(m => m.ContentType.StartsWith(type));
        return await query.OrderByDescending(m => m.CreatedAt).ToListAsync(ct);
    }

    [HttpPost]
    [RequestSizeLimit(long.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
    public async Task<ActionResult<MediaFile>> Upload(IFormFile file, [FromServices] Microsoft.Extensions.Options.IOptions<StorageOptions> options, CancellationToken ct)
    {
        if (file.Length == 0) return Problem(title: "File rỗng.", statusCode: 400);
        if (file.Length > options.Value.MaxUploadBytes)
            return Problem(title: $"File vượt quá {options.Value.MaxUploadBytes / 1024 / 1024} MB. Video dài nên đăng lên YouTube rồi dán link.", statusCode: 413);

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedTypes.TryGetValue(extension, out var contentType))
            return Problem(title: "Chỉ hỗ trợ ảnh (jpg, png, webp, gif, avif), video (mp4, webm) và pdf.", statusCode: 400);

        await using var stream = file.OpenReadStream();
        var (url, storagePath) = await storage.SaveAsync(stream, extension.ToLowerInvariant(), ct);

        var media = new MediaFile
        {
            FileName = Path.GetFileName(file.FileName),
            Url = url,
            StoragePath = storagePath,
            ContentType = contentType,
            Size = file.Length,
        };
        db.MediaFiles.Add(media);
        await db.SaveChangesAsync(ct);
        return media;
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var media = await db.MediaFiles.FindAsync([id], ct);
        if (media is null) return NotFound();

        await storage.DeleteAsync(media.StoragePath, ct);
        db.MediaFiles.Remove(media);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
