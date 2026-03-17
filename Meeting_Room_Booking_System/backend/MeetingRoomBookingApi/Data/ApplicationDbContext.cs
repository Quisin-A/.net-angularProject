using Microsoft.EntityFrameworkCore;
using MeetingRoomBookingApi.Models;

namespace MeetingRoomBookingApi.Data
{
    // public class ApplicationDbContext : DbContext
    // {
    //     public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    //     {
    //     }

    //     public DbSet<User> Users { get; set; }

    //     public DbSet<Room> Rooms { get; set; }

    //     public DbSet<Booking> Bookings { get; set; }
    // }
    public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Force PostgreSQL to use 'timestamp with time zone'
        modelBuilder.Entity<Booking>()
            .Property(b => b.StartTime)
            .HasColumnType("timestamp with time zone");

        modelBuilder.Entity<Booking>()
            .Property(b => b.EndTime)
            .HasColumnType("timestamp with time zone");
    }
}
}
