using Microsoft.AspNetCore.Mvc;
using MeetingRoomBookingApi.Data;
using MeetingRoomBookingApi.DTOs;
using MeetingRoomBookingApi.Models;
using System.Linq;

namespace MeetingRoomBookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RoomsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetRooms()
        {
            return Ok(_context.Rooms.ToList());
        }

        [HttpGet("popularity-report")]
        public IActionResult GetRoomPopularityReport()
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            if (role != "Admin")
                return Unauthorized("Only Admin can view room popularity report");

            var report = _context.Rooms
                .GroupJoin(
                    _context.Bookings,
                    room => room.Id,
                    booking => booking.RoomId,
                    (room, bookings) => new RoomPopularityDto
                    {
                        RoomName = room.Name,
                        BookingCount = bookings.Count()
                    })
                .OrderByDescending(x => x.BookingCount)
                .ThenBy(x => x.RoomName)
                .ToList();

            return Ok(report);
        }

        [HttpPost]
        public IActionResult AddRoom(Room room)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            if (role != "Admin")
                return Unauthorized("Only Admin can add rooms");

            var normalizedName = room.Name?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
                return BadRequest("Room name is required.");

            var roomNameExists = _context.Rooms.Any(x => x.Name.ToLower() == normalizedName.ToLower());
            if (roomNameExists)
                return BadRequest("Room name already exists.");

            room.Name = normalizedName;

            _context.Rooms.Add(room);
            _context.SaveChanges();

            return Ok(room);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateRoom(int id, Room updatedRoom)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            if (role != "Admin")
                return Unauthorized("Only Admin can edit rooms");

            var room = _context.Rooms.Find(id);

            if (room == null)
                return NotFound();

            var normalizedName = updatedRoom.Name?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedName))
                return BadRequest("Room name is required.");

            var duplicateNameExists = _context.Rooms.Any(x => x.Id != id && x.Name.ToLower() == normalizedName.ToLower());
            if (duplicateNameExists)
                return BadRequest("Room name already exists.");

            room.Name = normalizedName;
            room.Capacity = updatedRoom.Capacity;
            room.Location = updatedRoom.Location;

            _context.SaveChanges();

            return Ok(room);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteRoom(int id)
        {
            var role = HttpContext.Items["UserRole"]?.ToString();

            if (role != "Admin")
                return Unauthorized("Only Admin can delete rooms");

            var room = _context.Rooms.Find(id);

            if (room == null)
                return NotFound();

            _context.Rooms.Remove(room);
            _context.SaveChanges();

            return Ok(new { message = "Room deleted successfully." });
        }
    }
}