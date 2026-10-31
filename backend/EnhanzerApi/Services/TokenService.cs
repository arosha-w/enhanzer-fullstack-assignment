using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EnhanzerApi.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EnhanzerApi.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAtUtc) Create(string email);
}

public class TokenService(IOptions<JwtOptions> options) : ITokenService
{
    private readonly JwtOptions _opt = options.Value;

    public (string Token, DateTime ExpiresAtUtc) Create(string email)
    {
        var expires = DateTime.UtcNow.AddMinutes(_opt.ExpiryMinutes);
        var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            _opt.Issuer, _opt.Audience,
            [new Claim(JwtRegisteredClaimNames.Sub, email), new Claim("company_code", email)],
            expires: expires, signingCredentials: creds);
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
