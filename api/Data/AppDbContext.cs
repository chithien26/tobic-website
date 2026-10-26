using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Tobic.Api.Domain;

namespace Tobic.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();

    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        // Npgsql only accepts UTC offsets for timestamptz.
        builder.Properties<DateTimeOffset>().HaveConversion<UtcDateTimeOffsetConverter>();
    }

    private class UtcDateTimeOffsetConverter() : ValueConverter<DateTimeOffset, DateTimeOffset>(v => v.ToUniversalTime(), v => v);

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Service>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(160);
            e.OwnsMany(x => x.Translations, t => t.ToJson());
            e.OwnsMany(x => x.Gallery, t => t.ToJson());
        });

        builder.Entity<Post>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(160);
            e.OwnsMany(x => x.Translations, t => t.ToJson());
            e.OwnsMany(x => x.Gallery, t => t.ToJson());
        });

        builder.Entity<Job>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(160);
            e.OwnsMany(x => x.Translations, t => t.ToJson());
        });

        builder.Entity<SiteSettings>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            e.OwnsMany(x => x.Translations, t => t.ToJson());
        });
    }
}
