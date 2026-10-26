using Microsoft.AspNetCore.Identity;

namespace Tobic.Api.Domain;

public static class Languages
{
    public const string Vi = "vi";
    public const string En = "en";
    public const string Ja = "ja";
    public const string Default = Vi;

    public static readonly string[] All = [Vi, En, Ja];
}

public static class Roles
{
    public const string Admin = "Admin";
    public const string Editor = "Editor";

    public static readonly string[] All = [Admin, Editor];
}

public class AppUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}

public interface ITranslation
{
    string Lang { get; set; }
    string Title { get; set; }
}

public abstract class ContentEntity<TTranslation> where TTranslation : class, ITranslation
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string Slug { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public string? CoverImageUrl { get; set; }
    public List<TTranslation> Translations { get; set; } = [];
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class MediaItem
{
    /// <summary>image | video | youtube</summary>
    public string Type { get; set; } = "image";
    public string Url { get; set; } = string.Empty;
    public string? Caption { get; set; }
}

public class ServiceTranslation : ITranslation
{
    public string Lang { get; set; } = Languages.Default;
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class Service : ContentEntity<ServiceTranslation>
{
    public List<MediaItem> Gallery { get; set; } = [];
}

public class PostTranslation : ITranslation
{
    public string Lang { get; set; } = Languages.Default;
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class Post : ContentEntity<PostTranslation>
{
    public List<MediaItem> Gallery { get; set; } = [];
}

public class JobTranslation : ITranslation
{
    public string Lang { get; set; } = Languages.Default;
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public string Salary { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class Job : ContentEntity<JobTranslation>
{
    public DateOnly? Deadline { get; set; }
}

public class MediaFile
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class SiteSettingsTranslation
{
    public string Lang { get; set; } = Languages.Default;
    public string Address { get; set; } = string.Empty;
    public string OfficeNote { get; set; } = string.Empty;
}

public class SiteSettings
{
    public const int SingletonId = 1;

    public int Id { get; set; } = SingletonId;
    public string CompanyName { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string TaxCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CeoName { get; set; } = string.Empty;
    public string Established { get; set; } = string.Empty;
    public string MapEmbedUrl { get; set; } = string.Empty;
    public string IntroVideoUrl { get; set; } = string.Empty;
    public string FacebookUrl { get; set; } = string.Empty;
    public string LinkedinUrl { get; set; } = string.Empty;
    public string YoutubeUrl { get; set; } = string.Empty;
    public List<SiteSettingsTranslation> Translations { get; set; } = [];
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
