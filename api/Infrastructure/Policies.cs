using Tobic.Api.Domain;

namespace Tobic.Api.Infrastructure;

public static class Policies
{
    /// <summary>Can edit services, posts, jobs and media.</summary>
    public const string Content = "content";

    /// <summary>Can also manage users and site settings.</summary>
    public const string Admin = "admin";

    public static readonly string[] ContentRoles = [Roles.Admin, Roles.Editor];
}

public static class RateLimits
{
    public const string Login = "login";
}
