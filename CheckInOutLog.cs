namespace HotelAPI.Models
{
    /// <summary>
    /// CheckInOutLog entity - audit trail for check-ins and check-outs
    /// </summary>
    public class CheckInOutLog
    {
        public int LogID { get; set; }
        public int BookingID { get; set; }
        public int StaffID { get; set; }
        public string ActionType { get; set; } = string.Empty; // CheckIn, CheckOut
        public DateTime ActionTime { get; set; } = DateTime.Now;
        public string? Notes { get; set; }
        
        // Navigation properties
        public Booking? Booking { get; set; }
        public Staff? Staff { get; set; }
    }
}

