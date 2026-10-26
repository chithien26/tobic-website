using System.Text.RegularExpressions;
using Ganss.Xss;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tobic.Api.Data;
using Tobic.Api.Domain;
using Tobic.Api.Infrastructure;

namespace Tobic.Api.Controllers;

/// <summary>
/// Public read endpoints under <c>api/{name}</c> and admin CRUD under <c>api/admin/{name}</c>
/// for a translatable content type.
/// </summary>
[ApiController]
public abstract partial class ContentControllerBase<TEntity, TTranslation>(
    AppDbContext db,
    HtmlSanitizer sanitizer,
    WebRevalidator revalidator) : ControllerBase
    where TEntity : ContentEntity<TTranslation>
    where TTranslation : class, ITranslation
{
    protected abstract string CacheTag { get; }

    /// <summary>Copies the type-specific fields from the request body onto the stored entity.</summary>
    protected abstract void CopyFields(TEntity source, TEntity target);

    protected virtual IOrderedQueryable<TEntity> Order(IQueryable<TEntity> query) =>
        query.OrderBy(x => x.SortOrder).ThenByDescending(x => x.PublishedAt);

    protected string CleanHtml(string? html) => string.IsNullOrWhiteSpace(html) ? string.Empty : sanitizer.Sanitize(html);

    [HttpGet("api/[controller]")]
    [AllowAnonymous]
    public async Task<List<TEntity>> GetPublished(CancellationToken ct) =>
        await Order(db.Set<TEntity>().AsNoTracking().Where(x => x.IsPublished)).ToListAsync(ct);

    [HttpGet("api/[controller]/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<TEntity>> GetBySlug(string slug, CancellationToken ct)
    {
        var entity = await db.Set<TEntity>().AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == slug && x.IsPublished, ct);
        return entity is null ? NotFound() : entity;
    }

    [HttpGet("api/admin/[controller]")]
    [Authorize(Policy = Policies.Content)]
    public async Task<List<TEntity>> GetAll(CancellationToken ct) =>
        await Order(db.Set<TEntity>().AsNoTracking()).ToListAsync(ct);

    [HttpGet("api/admin/[controller]/{id:guid}")]
    [Authorize(Policy = Policies.Content)]
    public async Task<ActionResult<TEntity>> GetById(Guid id, CancellationToken ct)
    {
        var entity = await db.Set<TEntity>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity is null ? NotFound() : entity;
    }

    [HttpPost("api/admin/[controller]")]
    [Authorize(Policy = Policies.Content)]
    public async Task<ActionResult<TEntity>> Create(TEntity input, CancellationToken ct)
    {
        if (await ValidateAsync(input, null, ct) is { } error) return error;

        var entity = Activator.CreateInstance<TEntity>();
        Apply(input, entity);
        db.Set<TEntity>().Add(entity);
        await db.SaveChangesAsync(ct);
        await revalidator.RevalidateAsync(CacheTag);

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("api/admin/[controller]/{id:guid}")]
    [Authorize(Policy = Policies.Content)]
    public async Task<ActionResult<TEntity>> Update(Guid id, TEntity input, CancellationToken ct)
    {
        var entity = await db.Set<TEntity>().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null) return NotFound();
        if (await ValidateAsync(input, id, ct) is { } error) return error;

        Apply(input, entity);
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        await revalidator.RevalidateAsync(CacheTag);

        return entity;
    }

    [HttpDelete("api/admin/[controller]/{id:guid}")]
    [Authorize(Policy = Policies.Content)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var deleted = await db.Set<TEntity>().Where(x => x.Id == id).ExecuteDeleteAsync(ct);
        if (deleted == 0) return NotFound();
        await revalidator.RevalidateAsync(CacheTag);
        return NoContent();
    }

    private void Apply(TEntity input, TEntity entity)
    {
        entity.Slug = input.Slug.Trim();
        entity.SortOrder = input.SortOrder;
        entity.IsPublished = input.IsPublished;
        entity.PublishedAt = input.PublishedAt ?? (input.IsPublished ? entity.PublishedAt ?? DateTimeOffset.UtcNow : null);
        entity.CoverImageUrl = string.IsNullOrWhiteSpace(input.CoverImageUrl) ? null : input.CoverImageUrl.Trim();
        CopyFields(input, entity);
    }

    private async Task<ActionResult?> ValidateAsync(TEntity input, Guid? id, CancellationToken ct)
    {
        if (!SlugPattern().IsMatch(input.Slug ?? string.Empty))
            return Problem(title: "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang (vd: mo-hinh-bim).", statusCode: 400);

        if (input.Translations.Any(t => !Languages.All.Contains(t.Lang)) ||
            input.Translations.GroupBy(t => t.Lang).Any(g => g.Count() > 1))
            return Problem(title: "Ngôn ngữ không hợp lệ hoặc bị trùng.", statusCode: 400);

        var vi = input.Translations.FirstOrDefault(t => t.Lang == Languages.Default);
        if (vi is null || string.IsNullOrWhiteSpace(vi.Title))
            return Problem(title: "Cần nhập tiêu đề tiếng Việt.", statusCode: 400);

        if (await db.Set<TEntity>().AnyAsync(x => x.Slug == input.Slug && x.Id != id, ct))
            return Problem(title: $"Slug \"{input.Slug}\" đã được dùng.", statusCode: 409);

        return null;
    }

    [GeneratedRegex("^[a-z0-9]+(-[a-z0-9]+)*$")]
    private static partial Regex SlugPattern();
}

[Route("")]
public class ServicesController(AppDbContext db, HtmlSanitizer sanitizer, WebRevalidator revalidator)
    : ContentControllerBase<Service, ServiceTranslation>(db, sanitizer, revalidator)
{
    protected override string CacheTag => "services";

    protected override void CopyFields(Service source, Service target)
    {
        target.Translations = source.Translations
            .Select(t => new ServiceTranslation { Lang = t.Lang, Title = t.Title.Trim(), Summary = t.Summary.Trim(), Body = CleanHtml(t.Body) })
            .ToList();
        target.Gallery = MediaRules.Clean(source.Gallery);
    }
}

[Route("")]
public class PostsController(AppDbContext db, HtmlSanitizer sanitizer, WebRevalidator revalidator)
    : ContentControllerBase<Post, PostTranslation>(db, sanitizer, revalidator)
{
    protected override string CacheTag => "posts";

    protected override IOrderedQueryable<Post> Order(IQueryable<Post> query) =>
        query.OrderByDescending(x => x.PublishedAt).ThenBy(x => x.SortOrder);

    protected override void CopyFields(Post source, Post target)
    {
        target.Translations = source.Translations
            .Select(t => new PostTranslation { Lang = t.Lang, Title = t.Title.Trim(), Excerpt = t.Excerpt.Trim(), Body = CleanHtml(t.Body) })
            .ToList();
        target.Gallery = MediaRules.Clean(source.Gallery);
    }
}

[Route("")]
public class JobsController(AppDbContext db, HtmlSanitizer sanitizer, WebRevalidator revalidator)
    : ContentControllerBase<Job, JobTranslation>(db, sanitizer, revalidator)
{
    protected override string CacheTag => "jobs";

    protected override IOrderedQueryable<Job> Order(IQueryable<Job> query) =>
        query.OrderBy(x => x.SortOrder).ThenByDescending(x => x.PublishedAt);

    protected override void CopyFields(Job source, Job target)
    {
        target.Deadline = source.Deadline;
        target.Translations = source.Translations
            .Select(t => new JobTranslation
            {
                Lang = t.Lang,
                Title = t.Title.Trim(),
                Location = t.Location.Trim(),
                EmploymentType = t.EmploymentType.Trim(),
                Salary = t.Salary.Trim(),
                Body = CleanHtml(t.Body),
            })
            .ToList();
    }
}

internal static class MediaRules
{
    private static readonly string[] Types = ["image", "video", "youtube"];

    public static List<MediaItem> Clean(IEnumerable<MediaItem> items) => items
        .Where(m => Types.Contains(m.Type) && !string.IsNullOrWhiteSpace(m.Url))
        .Select(m => new MediaItem { Type = m.Type, Url = m.Url.Trim(), Caption = m.Caption?.Trim() })
        .ToList();
}
