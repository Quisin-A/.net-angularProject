using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MeetingRoomBookingApi.Data;
using MeetingRoomBookingApi.Models;
using System.Linq;

namespace MeetingRoomBookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult CreateBooking(Booking booking)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();
            var userIdHeader = HttpContext.Request.Headers["userId"].ToString();

            if (string.IsNullOrWhiteSpace(role) || string.IsNullOrWhiteSpace(userIdHeader) || !int.TryParse(userIdHeader, out var actingUserId))
            {
                return Unauthorized("User context is required.");
            }

            var roomExists = _context.Rooms.Any(r => r.Id == booking.RoomId);
            if (!roomExists)
            {
                return NotFound("Room not found.");
            }

            var targetUser = _context.Users.FirstOrDefault(u => u.Id == booking.UserId);
            if (targetUser == null)
            {
                return NotFound("Selected user not found.");
            }

            if (!targetUser.IsActive)
            {
                return BadRequest("Selected user is inactive.");
            }

            if (role != "Admin" && booking.UserId != actingUserId)
            {
                return Unauthorized("You can only create bookings for yourself.");
            }

            // if (booking.StartTime < DateTime.Now)
            if (booking.StartTime < DateTime.UtcNow)

            {
                return BadRequest("Start time cannot be in the past.");
            }

            // 1. Logic Validation
            if (booking.EndTime <= booking.StartTime)
            {
                return BadRequest("End time must be after start time.");
            }

            // 2. Double-Booking Prevention Logic
            // var isOverlapping = _context.Bookings.Any(b =>
            //     b.RoomId == booking.RoomId &&
            //     b.StartTime < booking.EndTime &&
            //     b.EndTime > booking.StartTime);
            var isOverlapping = _context.Bookings.Any(b =>
            b.RoomId == booking.RoomId &&
            !(booking.EndTime <= b.StartTime || booking.StartTime >= b.EndTime));

            if (isOverlapping)
            {
                return BadRequest("The room is already booked for this time slot.");
            }
//
            // booking.StartTime = booking.StartTime.ToUniversalTime();
            // booking.EndTime = booking.EndTime.ToUniversalTime();
            booking.StartTime = booking.StartTime.ToUniversalTime();
            booking.EndTime = booking.EndTime.ToUniversalTime();
            // booking.StartTime = DateTime.SpecifyKind(booking.StartTime, DateTimeKind.Utc);
            // booking.EndTime = DateTime.SpecifyKind(booking.EndTime, DateTimeKind.Utc)
            // booking.StartTime = DateTime.SpecifyKind(booking.StartTime, DateTimeKind.Utc);
            // booking.EndTime = DateTime.SpecifyKind(booking.EndTime, DateTimeKind.Utc);
//
            _context.Bookings.Add(booking);
            _context.SaveChanges();

            return Ok(booking);
        }

        [HttpGet("my/{userId}")]
        public IActionResult MyBookings(int userId)
        {
            // Use .Include to send Room details to Sarah/Mike
            var bookings = _context.Bookings
                .Include(b => b.Room) 
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.StartTime)
                .ToList();

            return Ok(bookings);
        }

        [HttpGet]
        public IActionResult AllBookings()
        {
            // Assuming Middleware sets the Role in HttpContext
            var role = HttpContext.Items["UserRole"]?.ToString();

            if (role != "Admin")
                return Unauthorized("Only Admin can view all bookings");

            // Admin sees Room AND User (Employee) names
            return Ok(_context.Bookings
                .Include(b => b.Room)
                .Include(b => b.User)
                .OrderByDescending(b => b.StartTime)
                .ToList());
        }

        [HttpDelete("{id}")]
        public IActionResult CancelBooking(int id)
        {
            var booking = _context.Bookings.Find(id);
            if (booking == null) return NotFound("Booking not found.");

            var role = HttpContext.Items["UserRole"]?.ToString();
            var userIdHeader = HttpContext.Request.Headers["userId"].ToString();
            
            // RBAC: Admin can delete any, User can delete only their own
            bool isAuthorized = role == "Admin" || 
                                (!string.IsNullOrEmpty(userIdHeader) && 
                                 int.TryParse(userIdHeader, out var userId) && 
                                 booking.UserId == userId);

            if (!isAuthorized)
                return Unauthorized("You can only cancel your own bookings.");

            _context.Bookings.Remove(booking);
            _context.SaveChanges();

            return Ok(new { message = "Booking cancelled successfully." });
        }
    }
}