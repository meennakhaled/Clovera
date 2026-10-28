using Clovera.Api.Data;
using Clovera.Api.Models;
using Clovera.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────────────────────────────
// 1. DATABASE — Tell EF Core to use SQL Server
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// ─────────────────────────────────────────────────────────────────────────────
// 2. ASP.NET CORE IDENTITY — User management with password hashing
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password rules (must match what the React frontend validates)
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;

    // Email must be unique across all users
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()  // store users in SQL Server via EF Core
.AddDefaultTokenProviders();               // enables password reset tokens later

// ─────────────────────────────────────────────────────────────────────────────
// 3. JWT AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey is not configured.");
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    // Make JWT the default scheme for this API
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ClockSkew = TimeSpan.Zero // tokens expire exactly when they say
    };
});

builder.Services.AddAuthorization();

// ─────────────────────────────────────────────────────────────────────────────
// 4. CORS — Allow the React frontend to call this API
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("Clovera", policy =>
        policy.WithOrigins("http://localhost:5173")  // React dev server
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());                  // needed for cookies
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. CUSTOM SERVICES
// ─────────────────────────────────────────────────────────────────────────────
// Scoped = one instance per HTTP request (right choice for most services)
builder.Services.AddScoped<JwtService>();

// ─────────────────────────────────────────────────────────────────────────────
// 6. CONTROLLERS + SWAGGER
// ─────────────────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Clovera API",
        Version = "v1",
        Description = "Authentication API for the Clovera plant app"
    });

    // Add JWT auth button to Swagger UI so we can test protected endpoints
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token (without the 'Bearer ' prefix)"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUILD THE APP
// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ─────────────────────────────────────────────────────────────────────────────
// 6. MIDDLEWARE PIPELINE — Order matters! Top → Bottom
// ─────────────────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Clovera API v1");
        options.RoutePrefix = "swagger"; // available at /swagger
    });
}

app.UseHttpsRedirection();

app.UseCors("Clovera");       // ← MUST come before auth middleware

app.UseAuthentication();      // "Who are you?" — reads & validates the JWT token
app.UseAuthorization();       // "Are you allowed?" — checks [Authorize] attributes

app.MapControllers();

app.Run();
