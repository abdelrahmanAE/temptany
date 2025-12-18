namespace HotelAPI.Models
{
    /// <summary>
    /// Payment entity - payment transactions
    /// </summary>
    public class Payment
    {
        public int PaymentID { get; set; }
        public int BookingID { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty; // Cash, Card, Online
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Completed"; // Pending, Completed, Refunded
        public string? ReceiptNumber { get; set; }
        
        // Navigation property
        public Booking? Booking { get; set; }
    }
}

