using System.ComponentModel.DataAnnotations;

namespace Clovera.Api.DTOs;

/// <summary>
/// The data the React frontend sends when a user fills in the Login form.
/// Matches: POST /auth/login  { email, password }
/// </summary>
public class LoginRequest
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}
