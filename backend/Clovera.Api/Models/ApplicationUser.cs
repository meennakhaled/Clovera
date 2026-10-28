using Microsoft.AspNetCore.Identity;

namespace Clovera.Api.Models;

/// <summary>
/// Our custom user model. We extend IdentityUser to add extra fields
/// that the default user table doesn't have (like a display name).
/// IdentityUser already gives us: Id, Email, PasswordHash, UserName, etc.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// The display name shown in the UI (e.g. "Mariam").
    /// This maps to the "name" field the React frontend expects.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// URL to the user's avatar image.
    /// Null for email/password users; filled in for Google users.
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Tracks how the account was created.
    /// "local" = email/password, "google" = Google OAuth
    /// </summary>
    public string AuthProvider { get; set; } = "local";
}
