using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tobic.Api.Domain;
using Tobic.Api.Infrastructure;

namespace Tobic.Api.Controllers;

public record CreateUserRequest([Required, EmailAddress] string Email, [Required] string DisplayName, [Required] string Password, [Required] string Role);
public record UpdateUserRequest([Required] string DisplayName, [Required] string Role);
public record ResetPasswordRequest([Required] string NewPassword);

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = Policies.Admin)]
public class UsersController(UserManager<AppUser> users) : ControllerBase
{
    [HttpGet]
    public async Task<List<UserInfo>> GetAll()
    {
        var list = await users.Users.OrderBy(u => u.Email).ToListAsync();
        var result = new List<UserInfo>(list.Count);
        foreach (var u in list)
        {
            result.Add(new UserInfo(u.Id, u.Email!, u.DisplayName, await users.GetRolesAsync(u)));
        }
        return result;
    }

    [HttpPost]
    public async Task<ActionResult<UserInfo>> Create(CreateUserRequest request)
    {
        if (!Roles.All.Contains(request.Role)) return Problem(title: "Quyền không hợp lệ.", statusCode: 400);

        var user = new AppUser { UserName = request.Email, Email = request.Email, DisplayName = request.DisplayName, EmailConfirmed = true };
        var created = await users.CreateAsync(user, request.Password);
        if (!created.Succeeded) return AuthController.IdentityProblem(this, created);

        await users.AddToRoleAsync(user, request.Role);
        return new UserInfo(user.Id, user.Email, user.DisplayName, [request.Role]);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserInfo>> Update(string id, UpdateUserRequest request)
    {
        if (!Roles.All.Contains(request.Role)) return Problem(title: "Quyền không hợp lệ.", statusCode: 400);
        var user = await users.FindByIdAsync(id);
        if (user is null) return NotFound();
        if (id == CurrentUserId && request.Role != Roles.Admin)
            return Problem(title: "Không thể tự bỏ quyền Admin của chính mình.", statusCode: 400);

        user.DisplayName = request.DisplayName;
        await users.UpdateAsync(user);
        var current = await users.GetRolesAsync(user);
        await users.RemoveFromRolesAsync(user, current);
        await users.AddToRoleAsync(user, request.Role);
        return new UserInfo(user.Id, user.Email!, user.DisplayName, [request.Role]);
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(string id, ResetPasswordRequest request)
    {
        var user = await users.FindByIdAsync(id);
        if (user is null) return NotFound();

        var token = await users.GeneratePasswordResetTokenAsync(user);
        var result = await users.ResetPasswordAsync(user, token, request.NewPassword);
        return result.Succeeded ? NoContent() : AuthController.IdentityProblem(this, result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (id == CurrentUserId) return Problem(title: "Không thể xoá tài khoản đang đăng nhập.", statusCode: 400);
        var user = await users.FindByIdAsync(id);
        if (user is null) return NotFound();
        await users.DeleteAsync(user);
        return NoContent();
    }

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
}
