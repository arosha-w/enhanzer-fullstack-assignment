namespace EnhanzerApi.Options;

public class JwtOptions
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "EnhanzerApi";
    public string Audience { get; set; } = "EnhanzerClient";
    public int ExpiryMinutes { get; set; } = 60;
}

public class ExternalApiOptions
{
    public string BaseUrl { get; set; } = string.Empty;
    public string DeviceId { get; set; } = "D001";
}
