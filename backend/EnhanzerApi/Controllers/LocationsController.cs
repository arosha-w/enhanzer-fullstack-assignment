using EnhanzerApi.Data;
using EnhanzerApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerApi.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class LocationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LocationDto>>> Get(CancellationToken ct)
    {
        var items = await db.LocationDetails.AsNoTracking()
            .OrderBy(l => l.LocationName)
            .Select(l => new LocationDto(l.LocationCode, l.LocationName))
            .ToListAsync(ct);
        return Ok(items);
    }
}