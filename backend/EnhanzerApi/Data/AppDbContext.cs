using EnhanzerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<LocationDetail> LocationDetails => Set<LocationDetail>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<LocationDetail>(e =>
        {
            e.ToTable("Location_Details");
            e.HasKey(x => x.Id);
            e.Property(x => x.LocationCode).HasColumnName("Location_Code").HasMaxLength(50).IsRequired();
            e.Property(x => x.LocationName).HasColumnName("Location_Name").HasMaxLength(200).IsRequired();
            e.Property(x => x.CreatedAt).HasColumnName("Created_At");
            e.HasIndex(x => x.LocationCode).IsUnique().HasDatabaseName("UQ_Location_Details_Code");
        });
    }
}