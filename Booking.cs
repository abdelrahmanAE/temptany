namespace HotelAPI.Models
{
    /// <summary>
    /// Booking entity - el 7agozat bta3et el owar
    /// </summary>
    public class Booking
    {
        public int BookingID { get; set; }
        public int CustomerID { get; set; }
        public int RoomID { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public DateTime BookingDate { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, CheckedIn, CheckedOut, Cancelled
        public decimal? TotalAmount { get; set; }
        public string? Notes { get; set; }
        
        // Navigation properties - de el 3alagat m3 el entities el tanya
        public Customer? Customer { get; set; }
        public Room? Room { get; set; }
        
        // Computed properties - de bet-7seb 3adad el lyaly
        public int Nights => (CheckOutDate - CheckInDate).Days;
    }
}
