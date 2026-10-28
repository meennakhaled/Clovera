using Clovera.Api.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Clovera.Api.Services;

/// <summary>
/// JwtService is responsible for generating JWT tokens.
///
/// What is a JWT?
/// A JWT (JSON Web Token) is a small, signed string the server gives to the
/// browser after login. The browser sends it back with every request so the
/// server knows who you are — without checking the database every time.
///
/// A JWT has 3 parts separated by dots:  header.payload.signature
/// - Header:    the algorithm used (HS256)
/// - Payload:   the user's data (id, email, name) — NOT secret, just encoded
/// - Signature: a hash of header+payload using our SecretKey — proves it's real
/// </summary>
public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Generates a JWT token for the given user.
    /// The token contains "claims" — key/value pairs about the user.
    /// </summary>
    public string GenerateToken(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");

        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey is not configured.");

        // The signing key — must be the same key we use to validate tokens
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var signingKey = new SymmetricSecurityKey(keyBytes);
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        // Claims = facts about the user that are packed into the token.
        // The React frontend never reads these directly, but the API uses them
        // in [Authorize] endpoints to know who is making the request.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),           // subject = user ID
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.Name, user.DisplayName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // unique token ID
            new Claim(ClaimTypes.NameIdentifier, user.Id),             // used by User.FindFirstValue()
        };

        // How long the token is valid
        var expirationHours = int.Parse(jwtSettings["ExpirationHours"] ?? "24");

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );

        // Convert the token object to the string format: "xxxxx.yyyyy.zzzzz"
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
