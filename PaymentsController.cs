using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelAPI.Data;
using HotelAPI.Models;
using HotelAPI.DTOs;

namespace HotelAPI.Controllers
{
    /// <summary>
    /// Payments controller - manages payment transactions
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly HotelDbContext _context;
        
        public PaymentsController(HotelDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Get all payments (Admin/Staff only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Booking)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentID,
                    BookingId = p.BookingID,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentDate = p.PaymentDate,
                    Status = p.Status,
                    ReceiptNumber = p.ReceiptNumber
                })
                .ToListAsync();
            
            return Ok(payments);
        }
        
        /// <summary>
        /// Get payment by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.PaymentID == id);
            
            if (payment == null)
                return NotFound(new { message = "Payment not found" });
            
            return Ok(new PaymentDto
            {
                PaymentId = payment.PaymentID,
                BookingId = payment.BookingID,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                PaymentDate = payment.PaymentDate,
                Status = payment.Status,
                ReceiptNumber = payment.ReceiptNumber
            });
        }
        
        /// <summary>
        /// Get payments for a booking
        /// </summary>
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetPaymentsByBooking(int bookingId)
        {
            var payments = await _context.Payments
                .Where(p => p.BookingID == bookingId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentID,
                    BookingId = p.BookingID,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    PaymentDate = p.PaymentDate,
                    Status = p.Status,
                    ReceiptNumber = p.ReceiptNumber
                })
                .ToListAsync();
            
            return Ok(payments);
        }
        
        /// <summary>
        /// Create a new payment (Staff only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            // Validate booking exists
            var booking = await _context.Bookings.FindAsync(dto.BookingId);
            if (booking == null)
                return NotFound(new { message = "Booking not found" });
            
            // Generate receipt number
            var receiptNumber = GenerateReceiptNumber();
            
            // Create payment
            var payment = new Payment
            {
                BookingID = dto.BookingId,
                Amount = dto.Amount,
                PaymentMethod = dto.PaymentMethod,
                PaymentDate = DateTime.Now,
                Status = "Completed",
                ReceiptNumber = receiptNumber
            };
            
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            
            return Ok(new 
            { 
                message = "Payment processed successfully",
                paymentId = payment.PaymentID,
                receiptNumber = receiptNumber
            });
        }
        
        /// <summary>
        /// Refund a payment (Admin only)
        /// </summary>
        [HttpPut("{id}/refund")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RefundPayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            
            if (payment == null)
                return NotFound(new { message = "Payment not found" });
            
            if (payment.Status != "Completed")
                return BadRequest(new { message = "Only completed payments can be refunded" });
            
            payment.Status = "Refunded";
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Payment refunded successfully" });
        }
        
        /// <summary>
        /// Generate unique receipt number
        /// </summary>
        private string GenerateReceiptNumber()
        {
            var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"RCP-{timestamp}-{random}";
        }
    }
}

