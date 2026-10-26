using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Tobic.Api.Domain;
using Tobic.Api.Infrastructure;

namespace Tobic.Api.Controllers;

public record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);
public record UserInfo(string Id, string Email, string DisplayName, IList<string> Roles);
public record LoginResponse(string Token, DateTimeOffset ExpiresAt, UserInfo User);
public record ChangePasswordRequest([Required] string CurrentPassword, [Required] string NewPassword);

[ApiController]
[Route("api/auth")]
public class AuthController(UserManager<AppUser> users, JwtTokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimits.Login)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null) return InvalidLogin();

        if (await users.IsLockedOutAsync(user))
            return Problem(title: "Tài khoản tạm khoá do đăng nhập sai nhiều lần. Thử lại sau ít phút.", statusCode: 423);

        if (!await users.CheckPasswordAsync(user, request.Password))
        {
            await users.AccessFailedAsync(user);
            return InvalidLogin();
        }

        await users.ResetAccessFailedCountAsync(user);
        var roles = await users.GetRolesAsync(user);
        var (token, expiresAt) = tokens.Create(user, roles);
        return new LoginResponse(token, expiresAt, new UserInfo(user.Id, user.Email!, user.DisplayName, roles));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfo>> Me()
    {
        var user = await users.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty);
        if (user is null) return Unauthorized();
        return new UserInfo(user.Id, user.Email!, user.DisplayName, await users.GetRolesAsync(user));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await users.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty);
        if (user is null) return Unauthorized();

        var result = await users.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        return result.Succeeded ? NoContent() : IdentityProblem(this, result);
    }

    private ObjectResult InvalidLogin() => Problem(title: "Email hoặc mật khẩu không đúng.", statusCode: 401);

    internal static ObjectResult IdentityProblem(ControllerBase controller, IdentityResult result) =>
        controller.Problem(title: string.Join(" ", result.Errors.Select(e => e.Description)), statusCode: 400);
}
