namespace Clovera.Api.DTOs;

/// <summary>
/// The user object nested inside AuthResponse.
/// This is the exact shape the React frontend expects in authService.js:
///   { id, name, email, avatarUrl }
/// </summary>
public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

/// <summary>
/// The response returned after a successful login, register, or Google sign-in.
/// Shape (from BACKEND_INTEGRATION.md):
///   { accessToken: "...", user: { id, name, email, avatarUrl } }
///
/// The React frontend reads result.accessToken and result.user
/// in authService.js → persist().
/// </summary>
public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}
