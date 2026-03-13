namespace MeetingRoomBookingApi.DTOs
{
    public class RoomPopularityDto
    {
        public string RoomName { get; set; } = string.Empty;

        public int BookingCount { get; set; }
    }
}
