using System.Security.Claims;
using System.Threading.RateLimiting;
using Ganss.Xss;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Tobic.Api.Data;
using Tobic.Api.Domain;
using Tobic.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// Hosts like Render tell the container which port to listen on.
if (Environment.GetEnvironmentVariable("PORT") is { Length: > 0 } port)
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.Configure<JwtOptions>(config.GetSection("Jwt"));
builder.Services.Configure<WebOptions>(config.GetSection("Web"));
builder.Services.Configure<StorageOptions>(config.GetSection("Storage"));
builder.Services.Configure<SeedOptions>(config.GetSection("Seed"));

var jwt = config.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
if (jwt.Key.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must be set to a random string of at least 32 characters.");
}

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(ConnectionStrings.Normalize(config.GetConnectionString("Default"))));

builder.Services
    .AddIdentityCore<AppUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
        o.Password.RequiredLength = 8;
        o.Password.RequireNonAlphanumeric = false;
        o.Lockout.MaxFailedAccessAttempts = 5;
        o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = false;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = JwtTokenService.CreateKey(jwt.Key),
            NameClaimType = "name",
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
        o.Events = new JwtBearerEvents
        {
            OnTokenValidated = ctx =>
            {
                // JsonWebTokenHandler keeps "sub"; expose it as NameIdentifier for controllers.
                if (ctx.Principal?.Identity is ClaimsIdentity identity && identity.FindFirst("sub") is { } sub)
                {
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, sub.Value));
                }
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.Content, p => p.RequireRole(Policies.ContentRoles))
    .AddPolicy(Policies.Admin, p => p.RequireRole(Roles.Admin));

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy(RateLimits.Login, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
});

var corsOrigins = config.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(corsOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()));

var storageOptions = config.GetSection("Storage").Get<StorageOptions>() ?? new StorageOptions();
builder.Services.Configure<FormOptions>(o => o.MultipartBodyLengthLimit = storageOptions.MaxUploadBytes);
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = storageOptions.MaxUploadBytes);

builder.Services.AddSingleton(_ =>
{
    var sanitizer = new HtmlSanitizer();
    sanitizer.AllowedTags.Add("iframe");
    sanitizer.AllowedAttributes.Add("class");
    sanitizer.AllowedAttributes.Add("allowfullscreen");
    sanitizer.AllowedAttributes.Add("frameborder");
    sanitizer.AllowedSchemes.Add("mailto");
    sanitizer.FilterUrl += (_, e) =>
    {
        // Only allow embeds from YouTube and Google Maps.
        if (e.Tag?.TagName == "IFRAME" &&
            !(e.OriginalUrl.StartsWith("https://www.youtube.com/embed/") ||
              e.OriginalUrl.StartsWith("https://www.youtube-nocookie.com/embed/") ||
              e.OriginalUrl.StartsWith("https://www.google.com/maps/embed")))
        {
            e.SanitizedUrl = null;
        }
    };
    return sanitizer;
});

builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddSingleton<IFileStorage, LocalFileStorage>();
builder.Services.AddHttpClient<WebRevalidator>(c => c.Timeout = TimeSpan.FromSeconds(5));

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var uploadRoot = Path.IsPathRooted(storageOptions.UploadRoot)
    ? storageOptions.UploadRoot
    : Path.Combine(app.Environment.ContentRootPath, storageOptions.UploadRoot);
Directory.CreateDirectory(uploadRoot);
CopyBundledLegacyUploads(Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads", "legacy"), Path.Combine(uploadRoot, "legacy"));
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadRoot),
    RequestPath = storageOptions.PublicPath,
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";
        ctx.Context.Response.Headers.AccessControlAllowOrigin = "*";
    },
});

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

await Seeder.RunAsync(app.Services);

app.Run();

// When uploads live on a mounted disk (Storage:UploadRoot outside the app), the migrated
// legacy images shipped in the image must be copied there so their URLs keep working.
static void CopyBundledLegacyUploads(string source, string target)
{
    if (!Directory.Exists(source) || Path.GetFullPath(source) == Path.GetFullPath(target))
    {
        return;
    }

    Directory.CreateDirectory(target);
    foreach (var file in Directory.EnumerateFiles(source))
    {
        var destination = Path.Combine(target, Path.GetFileName(file));
        if (!File.Exists(destination))
        {
            File.Copy(file, destination);
        }
    }
}
