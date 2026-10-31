using System.Net.Http.Json;
using System.Text.Json;
using EnhanzerApi.Dtos;
using EnhanzerApi.Options;
using Microsoft.Extensions.Options;

namespace EnhanzerApi.Services;

public record PosLoginResult(bool Success, string? Message, IReadOnlyList<LocationDto> Locations);

public interface IExternalPosClient
{
    Task<PosLoginResult> GetLoginDataAsync(string email, string password, CancellationToken ct);
}

/// <summary>Calls the Enhanzer staging POS API (action "GetLoginData").</summary>
public class ExternalPosClient(HttpClient http, IOptions<ExternalApiOptions> options) : IExternalPosClient
{
    // Keep the underscore property names exactly as the external API expects (no camelCase).
    private static readonly JsonSerializerOptions RawNames = new() { PropertyNamingPolicy = null };
    private readonly ExternalApiOptions _opt = options.Value;

    public async Task<PosLoginResult> GetLoginDataAsync(string email, string password, CancellationToken ct)
    {
        var payload = new
        {
            API_Action = "GetLoginData",
            Device_Id = _opt.DeviceId,
            Sync_Time = "",
            Company_Code = email,
            API_Body = new { Username = email, Pw = password }
        };

        using var response = await http.PostAsJsonAsync(_opt.BaseUrl, payload, RawNames, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
            return new PosLoginResult(false, ExtractMessage(body) ?? "Invalid email or password.", []);

        JsonDocument doc;
        try { doc = JsonDocument.Parse(body); }
        catch (JsonException) { return new PosLoginResult(false, "Unexpected response from the authentication service.", []); }

        using (doc)
        {
            // The array may be at the root or nested, so search for it by name.
            var arr = Find(doc.RootElement, "User_Locations");
            if (arr is not { ValueKind: JsonValueKind.Array } locations)
                return new PosLoginResult(false, ExtractMessage(body) ?? "Invalid email or password.", []);

            var list = new List<LocationDto>();
            foreach (var item in locations.EnumerateArray())
            {
                var code = Find(item, "Location_Code")?.ToString();
                var name = Find(item, "Location_Name")?.ToString();
                if (!string.IsNullOrWhiteSpace(code))
                    list.Add(new LocationDto(code!, name ?? code!));
            }
            return new PosLoginResult(true, null, list);
        }
    }

    private static string? ExtractMessage(string body)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            foreach (var key in new[] { "Message", "Error_Message", "Error" })
                if (Find(doc.RootElement, key) is { ValueKind: JsonValueKind.String } s && !string.IsNullOrWhiteSpace(s.GetString()))
                    return s.GetString();
        }
        catch (JsonException) { }
        return null;
    }

    private static JsonElement? Find(JsonElement el, string name)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                foreach (var p in el.EnumerateObject())
                {
                    if (string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase)) return p.Value.Clone();
                    var nested = Find(p.Value, name);
                    if (nested is not null) return nested;
                }
                break;
            case JsonValueKind.Array:
                foreach (var i in el.EnumerateArray())
                {
                    var nested = Find(i, name);
                    if (nested is not null) return nested;
                }
                break;
        }
        return null;
    }
}
