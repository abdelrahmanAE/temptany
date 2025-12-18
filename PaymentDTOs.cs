namespace HotelAPI.DTOs
{
    /// <summary>
    /// Create payment request DTO
    /// </summary>
    public class CreatePaymentDto
    {
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty; // Cash, Card, Online
    }
    
    /// <summary>
    /// Payment response DTO
    /// </summary>
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ReceiptNumber { get; set; }
    }
}

