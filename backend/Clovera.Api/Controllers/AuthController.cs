using Clovera.Api.DTOs;
using Clovera.Api.Models;
using Clovera.Api.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Clovera.Api.Controllers;

/// <summary>
/// AuthController handles all authentication endpoints.
///
/// [ApiController]  → enables automatic model validation and ProblemDetails error responses
/// [Route("api/[controller]")] → maps to /api/auth  ([controller] = "Auth" without "Controller")
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _configuration;

    // ASP.NET Core automatically injects these via Dependency Injection
    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        JwtService jwtService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/register
    // ─────────────────────────────────────────────────────────────────────────
    /// <summary>
    /// Creates a new user account.
    /// Returns a JWT token and user info on success.
    /// Returns 409 if the email is already registered.
    /// Returns 400 with field-level errors for validation failures.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // [ApiController] already validates the model and returns 400 if invalid,
        // but we can add extra checks here.

        // Check if the email is already taken
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            // 409 Conflict — matches what BACKEND_INTEGRATION.md specifies
            return Conflict(new ProblemDetails
            {
                Title = "Email already in use.",
                Status = StatusCodes.Status409Conflict,
                Detail = "An account with this email address already exists.",
                Extensions = { ["errors"] = new { Email = new[] { "This email address is already registered." } } }
            });
        }

        // Create the new user object
        var user = new ApplicationUser
        {
            UserName = request.Email,         // Identity uses UserName internally
            Email = request.Email,
            DisplayName = request.Username,   // shown in the UI as "name"
            AuthProvider = "local",
            EmailConfirmed = true             // skip email confirmation for now
        };

        // UserManager hashes the password and saves the user to SQL Server
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            // Convert Identity errors into the ProblemDetails format
            var errors = result.Errors
                .GroupBy(e => e.Code)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.Description).ToArray()
                );

            return BadRequest(new ProblemDetails
            {
                Title = "Registration failed.",
                Status = StatusCodes.Status400BadRequest,
                Extensions = { ["errors"] = errors }
            });
        }

        // Generate a JWT token for the new user
        var token = _jwtService.GenerateToken(user);

        return Ok(BuildAuthResponse(user, token));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────────────────────────────────────
    /// <summary>
    /// Authenticates a user with email and password.
    /// Returns a JWT token and user info on success.
    /// Returns 401 for wrong credentials (we never say WHICH field is wrong — security best practice).
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Find the user by email
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            // Don't say "email not found" — that leaks info about who has an account
            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid credentials.",
                Status = StatusCodes.Status401Unauthorized,
                Detail = "Email or password is incorrect."
            });
        }

        // Check the password — SignInManager handles lockout logic automatically
        var result = await _signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true  // locks account after too many failed attempts
        );

        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Account locked.",
                    Status = StatusCodes.Status401Unauthorized,
                    Detail = "Too many failed login attempts. Please try again later."
                });
            }

            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid credentials.",
                Status = StatusCodes.Status401Unauthorized,
                Detail = "Email or password is incorrect."
            });
        }

        var token = _jwtService.GenerateToken(user);
        return Ok(BuildAuthResponse(user, token));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/google
    // ─────────────────────────────────────────────────────────────────────────
    /// <summary>
    /// Handles Google Sign-In via the authorization code flow.
    ///
    /// Flow:
    /// 1. The React popup calls Google and gets a one-time "code"
    /// 2. React sends that code to us at POST /api/auth/google
    /// 3. We exchange it with Google for an id_token
    /// 4. We validate the id_token and get the user's email/name
    /// 5. We find or create the user in our database
    /// 6. We issue our own JWT token
    /// </summary>
    [HttpPost("google")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleSignIn([FromBody] GoogleAuthRequest request)
    {
        var clientId = _configuration["GoogleOAuth:ClientId"];
        var clientSecret = _configuration["GoogleOAuth:ClientSecret"];

        if (string.IsNullOrEmpty(clientId) || clientId == "YOUR_GOOGLE_CLIENT_ID")
        {
            return StatusCode(503, new ProblemDetails
            {
                Title = "Google sign-in not configured.",
                Status = 503,
                Detail = "Google OAuth credentials are not set up on the server. Please add ClientId and ClientSecret to appsettings.json."
            });
        }

        // ── Step 1: Exchange the one-time code for tokens ────────────────────
        GoogleJsonWebSignature.Payload googlePayload;
        try
        {
            // Exchange code → tokens using Google's token endpoint
            using var httpClient = new HttpClient();
            var tokenResponse = await httpClient.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["code"]          = request.Code,
                    ["client_id"]     = clientId,
                    ["client_secret"] = clientSecret!,
                    ["redirect_uri"]  = request.RedirectUri,
                    ["grant_type"]    = "authorization_code"
                })
            );

            if (!tokenResponse.IsSuccessStatusCode)
            {
                var errorBody = await tokenResponse.Content.ReadAsStringAsync();
                return Unauthorized(new ProblemDetails
                {
                    Title = "Google authentication failed.",
                    Status = StatusCodes.Status401Unauthorized,
                    Detail = "Could not exchange the authorization code with Google. The code may have expired."
                });
            }

            var tokenJson = await tokenResponse.Content.ReadFromJsonAsync<GoogleTokenResponse>();
            var idToken = tokenJson?.IdToken
                ?? throw new InvalidOperationException("Google did not return an id_token.");

            // ── Step 2: Validate the id_token — this is the security check ──
            // This verifies the token was really signed by Google and belongs to our app
            googlePayload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                }
            );
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid Google token.",
                Status = StatusCodes.Status401Unauthorized,
                Detail = "The Google token could not be verified."
            });
        }
        catch (Exception)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Google authentication failed.",
                Status = StatusCodes.Status401Unauthorized,
                Detail = "Could not complete Google sign-in. Please try again."
            });
        }

        // ── Step 3: Find or create the user in our database ─────────────────
        var email = googlePayload.Email;
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            // First time signing in with Google — create a new account
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                DisplayName = googlePayload.Name ?? email.Split('@')[0],
                AvatarUrl = googlePayload.Picture,
                AuthProvider = "google",
                EmailConfirmed = true  // Google already verified the email
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Could not create account.",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = "Failed to create your account. Please try again."
                });
            }
        }
        else
        {
            // Returning user — update their avatar in case it changed
            user.AvatarUrl = googlePayload.Picture;
            await _userManager.UpdateAsync(user);
        }

        var token = _jwtService.GenerateToken(user);
        return Ok(BuildAuthResponse(user, token));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/auth/me
    // ─────────────────────────────────────────────────────────────────────────
    /// <summary>
    /// Returns the current logged-in user's info.
    /// The React frontend calls this on page load to restore the session.
    /// Requires a valid JWT token in the Authorization header.
    /// Returns 401 if the token is missing or expired.
    /// </summary>
    [HttpGet("me")]
    [Authorize]  // ← this means: only authenticated users can call this
    public async Task<IActionResult> GetCurrentUser()
    {
        // User.FindFirstValue reads the claim we put in the token in JwtService
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return Unauthorized();

        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.DisplayName,
            Email = user.Email ?? "",
            AvatarUrl = user.AvatarUrl
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/logout
    // ─────────────────────────────────────────────────────────────────────────
    /// <summary>
    /// Signs the user out.
    /// For JWT authentication, the token is stateless — the real sign-out
    /// happens on the frontend (it deletes the token from sessionStorage).
    /// This endpoint exists so the frontend has a server-side hook for
    /// future use (e.g. cookie clearing, token blacklisting).
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // For JWT: nothing to do server-side (tokens are stateless).
        // The React frontend already clears sessionStorage in authService.js.
        // If you switch to httpOnly cookies later, call Response.Cookies.Delete() here.
        return Ok(new { message = "Signed out successfully." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper: builds the AuthResponse the React frontend expects
    // ─────────────────────────────────────────────────────────────────────────
    private static AuthResponse BuildAuthResponse(ApplicationUser user, string token)
    {
        return new AuthResponse
        {
            AccessToken = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.DisplayName,
                Email = user.Email ?? "",
                AvatarUrl = user.AvatarUrl
            }
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal DTO for deserializing Google's token endpoint response
// ─────────────────────────────────────────────────────────────────────────────
internal class GoogleTokenResponse
{
    [System.Text.Json.Serialization.JsonPropertyName("id_token")]
    public string? IdToken { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("access_token")]
    public string? AccessToken { get; set; }
}
