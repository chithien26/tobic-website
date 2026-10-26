using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tobic.Api.Data;
using Tobic.Api.Domain;
using Tobic.Api.Infrastructure;

namespace Tobic.Api.Controllers;

[ApiController]
public class SettingsController(AppDbContext db, WebRevalidator revalidator) : ControllerBase
{
    [HttpGet("api/settings")]
    [AllowAnonymous]
    public async Task<SiteSettings> Get(CancellationToken ct) =>
        await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct) ?? new SiteSettings();

    [HttpPut("api/admin/settings")]
    [Authorize(Policy = Policies.Admin)]
    public async Task<SiteSettings> Update(SiteSettings input, CancellationToken ct)
    {
        var settings = await db.SiteSettings.FirstOrDefaultAsync(ct);
        if (settings is null)
        {
            settings = new SiteSettings();
            db.SiteSettings.Add(settings);
        }

        settings.CompanyName = input.CompanyName.Trim();
        settings.LegalName = input.LegalName.Trim();
        settings.TaxCode = input.TaxCode.Trim();
        settings.Email = input.Email.Trim();
        settings.Phone = input.Phone.Trim();
        settings.CeoName = input.CeoName.Trim();
        settings.Established = input.Established.Trim();
        settings.MapEmbedUrl = input.MapEmbedUrl.Trim();
        settings.IntroVideoUrl = input.IntroVideoUrl.Trim();
        settings.FacebookUrl = input.FacebookUrl.Trim();
        settings.LinkedinUrl = input.LinkedinUrl.Trim();
        settings.YoutubeUrl = input.YoutubeUrl.Trim();
        settings.Translations = input.Translations
            .Where(t => Languages.All.Contains(t.Lang))
            .DistinctBy(t => t.Lang)
            .Select(t => new SiteSettingsTranslation { Lang = t.Lang, Address = t.Address.Trim(), OfficeNote = t.OfficeNote.Trim() })
            .ToList();
        settings.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        await revalidator.RevalidateAsync("settings");
        return settings;
    }
}
