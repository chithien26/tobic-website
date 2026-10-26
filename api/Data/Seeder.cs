using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Tobic.Api.Domain;
using Tobic.Api.Infrastructure;

namespace Tobic.Api.Data;

public class LegacyData
{
    public SiteSettings? Settings { get; set; }
    public List<Service> Services { get; set; } = [];
    public List<Post> Posts { get; set; } = [];
    public List<Job> Jobs { get; set; } = [];
}

public static class Seeder
{
    public static async Task RunAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<AppDbContext>();
        var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(Seeder));
        var seed = sp.GetRequiredService<IOptions<SeedOptions>>().Value;

        await db.Database.MigrateAsync();

        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role)) await roleManager.CreateAsync(new IdentityRole(role));
        }

        var users = sp.GetRequiredService<UserManager<AppUser>>();
        if (!await users.Users.AnyAsync())
        {
            if (string.IsNullOrWhiteSpace(seed.AdminEmail) || string.IsNullOrWhiteSpace(seed.AdminPassword))
            {
                logger.LogWarning("No users exist and Seed:AdminEmail / Seed:AdminPassword are not set; admin login is unavailable.");
            }
            else
            {
                var admin = new AppUser { UserName = seed.AdminEmail, Email = seed.AdminEmail, DisplayName = "Administrator", EmailConfirmed = true };
                var result = await users.CreateAsync(admin, seed.AdminPassword);
                if (!result.Succeeded) throw new InvalidOperationException(string.Join(" ", result.Errors.Select(e => e.Description)));
                await users.AddToRoleAsync(admin, Roles.Admin);
                logger.LogInformation("Created initial admin {Email}", seed.AdminEmail);
            }
        }

        await ImportLegacyAsync(db, sp, seed, logger);
    }

    private static async Task ImportLegacyAsync(AppDbContext db, IServiceProvider sp, SeedOptions seed, ILogger logger)
    {
        var env = sp.GetRequiredService<IWebHostEnvironment>();
        var path = Path.Combine(env.ContentRootPath, seed.LegacyDataFile);
        if (!File.Exists(path) || await db.Services.AnyAsync() || await db.Posts.AnyAsync()) return;

        await using var stream = File.OpenRead(path);
        var data = await JsonSerializer.DeserializeAsync<LegacyData>(stream, JsonSerializerOptions.Web)
                   ?? throw new InvalidOperationException($"Cannot read {path}");

        if (data.Settings is not null && !await db.SiteSettings.AnyAsync()) db.SiteSettings.Add(data.Settings);
        db.Services.AddRange(data.Services);
        db.Posts.AddRange(data.Posts);
        db.Jobs.AddRange(data.Jobs);

        var storage = sp.GetRequiredService<IOptions<StorageOptions>>().Value;
        var uploadRoot = Path.IsPathRooted(storage.UploadRoot) ? storage.UploadRoot : Path.Combine(env.ContentRootPath, storage.UploadRoot);
        var legacyDir = Path.Combine(uploadRoot, "legacy");
        if (Directory.Exists(legacyDir))
        {
            foreach (var file in new DirectoryInfo(legacyDir).EnumerateFiles())
            {
                db.MediaFiles.Add(new MediaFile
                {
                    FileName = file.Name,
                    StoragePath = $"legacy/{file.Name}",
                    Url = $"{storage.PublicPath.TrimEnd('/')}/legacy/{file.Name}",
                    ContentType = file.Extension.Equals(".mp4", StringComparison.OrdinalIgnoreCase) ? "video/mp4" : "image/webp",
                    Size = file.Length,
                });
            }
        }

        await db.SaveChangesAsync();
        logger.LogInformation("Imported legacy content: {Services} services, {Posts} posts", data.Services.Count, data.Posts.Count);
    }
}
