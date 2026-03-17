using Microsoft.EntityFrameworkCore;
using MeetingRoomBookingApi.Models;

namespace MeetingRoomBookingApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Room> Rooms { get; set; }

        public DbSet<Booking> Bookings { get; set; }
    }
    
}
