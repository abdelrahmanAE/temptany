using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using HotelAPI.Data;
using HotelAPI.Models;
using HotelAPI.DTOs;

namespace HotelAPI.Controllers
{
    /// <summary>
    /// Bookings controller - manages room reservations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly HotelDbContext _context;
        
        public BookingsController(HotelDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Get all bookings (Admin/Staff only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                    .ThenInclude(r => r!.RoomType)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new BookingDto
                {
                    BookingId = b.BookingID,
                    CustomerId = b.CustomerID,
                    CustomerName = b.Customer!.FirstName + " " + b.Customer.LastName,
                    RoomId = b.RoomID,
                    RoomNumber = b.Room!.RoomNumber,
                    RoomType = b.Room.RoomType!.TypeName,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    Status = b.Status,
                    TotalAmount = b.TotalAmount,
                    Notes = b.Notes
                })
                .ToListAsync();
            
            return Ok(bookings);
        }
        
        /// <summary>
        /// Get customer's own bookings
        /// </summary>
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            // Find customer by user ID
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.UserID == userId);
            
            if (customer == null)
                return NotFound(new { message = "Customer profile not found" });
            
            var bookings = await _context.Bookings
                .Include(b => b.Room)
                    .ThenInclude(r => r!.RoomType)
                .Where(b => b.CustomerID == customer.CustomerID)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new BookingDto
                {
                    BookingId = b.BookingID,
                    CustomerId = b.CustomerID,
                    RoomId = b.RoomID,
                    RoomNumber = b.Room!.RoomNumber,
                    RoomType = b.Room.RoomType!.TypeName,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    Status = b.Status,
                    TotalAmount = b.TotalAmount,
                    Notes = b.Notes
                })
                .ToListAsync();
            
            return Ok(bookings);
        }
        
        /// <summary>
        /// Get booking by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                    .ThenInclude(r => r!.RoomType)
                .FirstOrDefaultAsync(b => b.BookingID == id);
            
            if (booking == null)
                return NotFound(new { message = "Booking not found" });
            
            return Ok(new BookingDto
            {
                BookingId = booking.BookingID,
                CustomerId = booking.CustomerID,
                CustomerName = booking.Customer!.FirstName + " " + booking.Customer.LastName,
                RoomId = booking.RoomID,
                RoomNumber = booking.Room!.RoomNumber,
                RoomType = booking.Room.RoomType!.TypeName,
                CheckInDate = booking.CheckInDate,
                CheckOutDate = booking.CheckOutDate,
                Status = booking.Status,
                TotalAmount = booking.TotalAmount,
                Notes = booking.Notes
            });
        }
        
        /// <summary>
        /// Create a new booking
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            // Find customer
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.UserID == userId);
            
            if (customer == null)
                return BadRequest(new { message = "Customer profile not found" });
            
            // Validate dates
            if (dto.CheckOutDate <= dto.CheckInDate)
                return BadRequest(new { message = "Check-out date must be after check-in date" });
            
            if (dto.CheckInDate.Date < DateTime.Today)
                return BadRequest(new { message = "Check-in date cannot be in the past" });
            
            // Check room availability
            var isRoomBooked = await _context.Bookings
                .AnyAsync(b => b.RoomID == dto.RoomId &&
                              b.Status != "Cancelled" && b.Status != "CheckedOut" &&
                              b.CheckInDate < dto.CheckOutDate &&
                              b.CheckOutDate > dto.CheckInDate);
            
            if (isRoomBooked)
                return BadRequest(new { message = "Room is not available for the selected dates" });
            
            // Get room with price
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.RoomID == dto.RoomId);
            
            if (room == null)
                return NotFound(new { message = "Room not found" });
            
            // Calculate total amount
            var nights = (dto.CheckOutDate - dto.CheckInDate).Days;
            var totalAmount = nights * room.RoomType!.BasePrice;
            
            // Create booking
            var booking = new Booking
            {
                CustomerID = customer.CustomerID,
                RoomID = dto.RoomId,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                BookingDate = DateTime.Now,
                Status = "Pending",
                TotalAmount = totalAmount,
                Notes = dto.Notes
            };
            
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            
            return Ok(new 
            { 
                message = "Booking created successfully",
                bookingId = booking.BookingID,
                totalAmount = totalAmount
            });
        }
        
        /// <summary>
        /// Cancel a booking
        /// </summary>
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            
            if (booking == null)
                return NotFound(new { message = "Booking not found" });
            
            if (booking.Status != "Pending" && booking.Status != "Confirmed")
                return BadRequest(new { message = "Only pending or confirmed bookings can be cancelled" });
            
            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Booking cancelled successfully" });
        }
        
        /// <summary>
        /// Confirm a booking (Staff only)
        /// </summary>
        [HttpPut("{id}/confirm")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> ConfirmBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            
            if (booking == null)
                return NotFound(new { message = "Booking not found" });
            
            if (booking.Status != "Pending")
                return BadRequest(new { message = "Only pending bookings can be confirmed" });
            
            booking.Status = "Confirmed";
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Booking confirmed successfully" });
        }
        
        /// <summary>
        /// Check-in a guest (Staff only)
        /// </summary>
        [HttpPost("{id}/checkin")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> CheckIn(int id, [FromBody] CheckInOutDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.BookingID == id);
            
            if (booking == null)
                return NotFound(new { message = "Booking not found" });
            
            if (booking.Status != "Confirmed")
                return BadRequest(new { message = "Only confirmed bookings can be checked in" });
            
            // Update booking status
            booking.Status = "CheckedIn";
            
            // Update room status
            if (booking.Room != null)
                booking.Room.Status = "Occupied";
            
            // Create log entry
            var staffUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserID == staffUserId);
            
            if (staff != null)
            {
                var log = new CheckInOutLog
                {
                    BookingID = id,
                    StaffID = staff.StaffID,
                    ActionType = "CheckIn",
                    ActionTime = DateTime.Now,
                    Notes = dto.Notes
                };
                _context.CheckInOutLogs.Add(log);
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Check-in successful" });
        }
        
        /// <summary>
        /// Check-out a guest (Staff only)
        /// </summary>
        [HttpPost("{id}/checkout")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> CheckOut(int id, [FromBody] CheckInOutDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.BookingID == id);
            
            if (booking == null)
                return NotFound(new { message = "Booking not found" });
            
            if (booking.Status != "CheckedIn")
                return BadRequest(new { message = "Only checked-in guests can be checked out" });
            
            // Update booking status
            booking.Status = "CheckedOut";
            
            // Update room status
            if (booking.Room != null)
                booking.Room.Status = "Available";
            
            // Create log entry
            var staffUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserID == staffUserId);
            
            if (staff != null)
            {
                var log = new CheckInOutLog
                {
                    BookingID = id,
                    StaffID = staff.StaffID,
                    ActionType = "CheckOut",
                    ActionTime = DateTime.Now,
                    Notes = dto.Notes
                };
                _context.CheckInOutLogs.Add(log);
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Check-out successful" });
        }
        
        /// <summary>
        /// Get pending check-ins for today (Staff only)
        /// </summary>
        [HttpGet("pending-checkins")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetPendingCheckIns()
        {
            var today = DateTime.Today;
            
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .Where(b => b.Status == "Confirmed" && b.CheckInDate.Date <= today)
                .Select(b => new BookingDto
                {
                    BookingId = b.BookingID,
                    CustomerId = b.CustomerID,
                    CustomerName = b.Customer!.FirstName + " " + b.Customer.LastName,
                    RoomId = b.RoomID,
                    RoomNumber = b.Room!.RoomNumber,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    Status = b.Status,
                    TotalAmount = b.TotalAmount
                })
                .ToListAsync();
            
            return Ok(bookings);
        }
        
        /// <summary>
        /// Get current guests (Staff only)
        /// </summary>
        [HttpGet("current-guests")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetCurrentGuests()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Room)
                .Where(b => b.Status == "CheckedIn")
                .Select(b => new BookingDto
                {
                    BookingId = b.BookingID,
                    CustomerId = b.CustomerID,
                    CustomerName = b.Customer!.FirstName + " " + b.Customer.LastName,
                    RoomId = b.RoomID,
                    RoomNumber = b.Room!.RoomNumber,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    Status = b.Status,
                    TotalAmount = b.TotalAmount
                })
                .ToListAsync();
            
            return Ok(bookings);
        }
    }
}

