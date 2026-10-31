using EnhanzerApi.Data;
using EnhanzerApi.Dtos;
using EnhanzerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerApi.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct);
}

public class AuthService(
    IExternalPosClient pos, AppDbContext db, ITokenService tokens, ILogger<AuthService> logger) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim();
        var result = await pos.GetLoginDataAsync(email, request.Password, ct);
        if (!result.Success)
            throw new AuthenticationFailedException(result.Message ?? "Invalid email or password.");

        await SaveLocationsAsync(result.Locations, ct);

        var (token, expires) = tokens.Create(email);
        logger.LogInformation("User {Email} logged in with {Count} locations", email, result.Locations.Count);
        return new LoginResponse(token, email, expires, result.Locations);
    }

    private async Task SaveLocationsAsync(IReadOnlyList<LocationDto> incoming, CancellationToken ct)
    {
        var existing = await db.LocationDetails.ToListAsync(ct);

        foreach (var loc in incoming)
        {
            var row = existing.FirstOrDefault(e => e.LocationCode == loc.LocationCode);
            if (row is null)
                db.LocationDetails.Add(new LocationDetail
                {
                    LocationCode = loc.LocationCode,
                    LocationName = loc.LocationName
                });
            else
                row.LocationName = loc.LocationName;
        }
        await db.SaveChangesAsync(ct);
    }
}