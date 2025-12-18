namespace HotelAPI.DTOs
{
    /// <summary>
    /// Create booking request DTO
    /// </summary>
    public class CreateBookingDto
    {
        public int RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string? Notes { get; set; }
    }
    
    /// <summary>
    /// Booking response DTO
    /// </summary>
    public class BookingDto
    {
        public int BookingId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? TotalAmount { get; set; }
        public string? Notes { get; set; }
    }
    
    /// <summary>
    /// Check-in/Check-out request DTO
    /// </summary>
    public class CheckInOutDto
    {
        public string? Notes { get; set; }
    }
}

