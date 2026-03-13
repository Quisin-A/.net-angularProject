using Microsoft.AspNetCore.Mvc;
using MeetingRoomBookingApi.Data;
using MeetingRoomBookingApi.DTOs;
using MeetingRoomBookingApi.Models;
using System.Linq;

namespace MeetingRoomBookingApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Name, Email, and Password are required.");

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            var existingUser = _context.Users.FirstOrDefault(x => x.Email.ToLower() == normalizedEmail);
            if (existingUser != null)
                return BadRequest("Email is already registered.");

            var user = new User
            {
                Name = dto.Name.Trim(),
                Email = normalizedEmail,
                Password = dto.Password,
                Role = "User",
                IsActive = true
            };

            _context.Users.Add(user);
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

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.Users
                .FirstOrDefault(x => x.Email == dto.Email && x.Password == dto.Password);

            if (user == null)
                return Unauthorized();

            if (!user.IsActive)
                return StatusCode(StatusCodes.Status403Forbidden, "Account is inactive. Please contact the administrator.");

            return Ok(user);
        }
    }
}