using System.ComponentModel.DataAnnotations;

namespace EnhanzerApi.Dtos;

public class LoginRequest
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}

public record LocationDto(string LocationCode, string LocationName);

public record LoginResponse(string Token, string Email, DateTime ExpiresAtUtc, IReadOnlyList<LocationDto> Locations);
