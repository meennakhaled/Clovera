using Clovera.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Clovera.Api.Data;

/// <summary>
/// AppDbContext is the bridge between your C# code and SQL Server.
/// 
/// IdentityDbContext&lt;ApplicationUser&gt; automatically creates all the
/// ASP.NET Core Identity tables (AspNetUsers, AspNetRoles, etc.)
/// using our custom ApplicationUser instead of the default IdentityUser.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Override to customize how EF Core builds the database schema.
    /// We call the base method to keep all Identity configuration intact.
    /// Add your own table customizations here in the future.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // IMPORTANT: keeps Identity tables working

        // Example of future customization:
        // builder.Entity<ApplicationUser>().Property(u => u.DisplayName).HasMaxLength(100);
    }
}
