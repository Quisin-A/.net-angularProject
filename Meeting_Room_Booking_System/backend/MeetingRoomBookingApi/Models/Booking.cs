using System;

namespace MeetingRoomBookingApi.Models
{
    public class Booking
    {
        public int Id { get; set; }

        public int RoomId { get; set; }

        // ADD THIS LINE: This is the navigation property the error is asking for
        public Room? Room { get; set; }

        public int UserId { get; set; }
        // ADD THIS LINE: This allows .Include(b => b.User) to work
        public User? User { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }
    }
}