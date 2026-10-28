using System.ComponentModel.DataAnnotations;

namespace Clovera.Api.DTOs;

/// <summary>
/// The data the React frontend sends after the Google popup gives it a one-time code.
/// Matches: POST /auth/google  { code, redirectUri }
///
/// IMPORTANT: "code" is NOT the user's identity — it's a one-time code.
/// The backend must exchange it with Google to get the real id_token.
/// redirectUri must be "postmessage" for the popup flow.
/// </summary>
public class GoogleAuthRequest
{
    [Required(ErrorMessage = "Google authorization code is required.")]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string RedirectUri { get; set; } = "postmessage";
}
