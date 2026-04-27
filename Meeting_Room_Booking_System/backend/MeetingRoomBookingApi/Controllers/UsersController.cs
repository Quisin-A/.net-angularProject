using Microsoft.AspNetCore.Mvc;
using MeetingRoomBookingApi.Data;
using MeetingRoomBookingApi.Models;
using System.Linq;

namespace MeetingRoomBookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            if (role != "Admin")
                return Unauthorized();

            return Ok(_context.Users.ToList());
        }

        [HttpPut("disabled/{id}")]
        [HttpPut("disable/{id}")]
        public IActionResult ToggleUserStatus(
            int id,
            [FromQuery] bool clearFutureBookings = false,
            [FromQuery(Name = "clearFuture")] bool clearFuture = false)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            if (role != "Admin")
                return Unauthorized();

            var user = _context.Users.Find(id);

            if (user == null)
                return NotFound();

            var isBeingDeactivated = user.IsActive;
            user.IsActive = !user.IsActive;

            var shouldClearFutureBookings = clearFutureBookings || clearFuture;

            if (isBeingDeactivated && shouldClearFutureBookings)
            {
                var futureBookings = _context.Bookings
                    .Where(b => b.UserId == id && b.StartTime > DateTime.Now)
                    .ToList();

                if (futureBookings.Count > 0)
                {
                    _context.Bookings.RemoveRange(futureBookings);
                }
            }

            _context.SaveChanges();

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.IsActive
            });
        }
    }
}