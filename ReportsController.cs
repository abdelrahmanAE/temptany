using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelAPI.Data;

namespace HotelAPI.Controllers
{
    /// <summary>
    /// Reports controller - generates various reports (Admin/Staff only)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class ReportsController : ControllerBase
    {
        private readonly HotelDbContext _context;
        
        public ReportsController(HotelDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Get occupancy report for date range
        /// </summary>
        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancyReport(
            [FromQuery] DateTime start, 
            [FromQuery] DateTime end)
        {
            var totalRooms = await _context.Rooms.CountAsync();
            
            // Get daily occupancy data
            var bookings = await _context.Bookings
                .Where(b => b.Status != "Cancelled" &&
                           b.CheckInDate <= end &&
                           b.CheckOutDate >= start)
                .ToListAsync();
            
            var details = new List<object>();
            var totalOccupiedNights = 0;
            var daysInRange = (end - start).Days + 1;
            
            for (var date = start; date <= end; date = date.AddDays(1))
            {
                var occupiedCount = bookings.Count(b => 
                    b.CheckInDate <= date && b.CheckOutDate > date &&
                    (b.Status == "CheckedIn" || b.Status == "Confirmed" || b.Status == "CheckedOut"));
                
                totalOccupiedNights += occupiedCount;
                
                details.Add(new
                {
                    date = date.ToString("yyyy-MM-dd"),
                    occupied = occupiedCount,
                    available = totalRooms - occupiedCount,
                    occupancyRate = totalRooms > 0 ? Math.Round((double)occupiedCount / totalRooms * 100, 1) : 0
                });
            }
            
            var averageOccupancy = daysInRange > 0 && totalRooms > 0 
                ? Math.Round((double)totalOccupiedNights / (daysInRange * totalRooms) * 100, 1) 
                : 0;
            
            var peakOccupancy = details.Any() 
                ? details.Cast<dynamic>().Max(d => (double)d.occupancyRate) 
                : 0;
            
            return Ok(new
            {
                summary = new
                {
                    totalRooms,
                    averageOccupancy,
                    peakOccupancy,
                    totalNights = totalOccupiedNights
                },
                details
            });
        }
        
        /// <summary>
        /// Get revenue report for date range
        /// </summary>
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueReport(
            [FromQuery] DateTime start, 
            [FromQuery] DateTime end)
        {
            var payments = await _context.Payments
                .Where(p => p.Status == "Completed" &&
                           p.PaymentDate >= start &&
                           p.PaymentDate <= end)
                .ToListAsync();
            
            var totalRevenue = payments.Sum(p => p.Amount);
            var transactionCount = payments.Count;
            var averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;
            
            // Group by payment method
            var byMethod = payments
                .GroupBy(p => p.PaymentMethod)
                .Select(g => new
                {
                    method = g.Key,
                    total = g.Sum(p => p.Amount),
                    count = g.Count()
                })
                .OrderByDescending(x => x.total)
                .ToList();
            
            var topMethod = byMethod.FirstOrDefault()?.method ?? "N/A";
            
            // Group by month
            var details = payments
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new
                {
                    month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    revenue = g.Sum(p => p.Amount),
                    transactions = g.Count(),
                    avgAmount = g.Average(p => p.Amount)
                })
                .OrderBy(x => x.month)
                .ToList();
            
            return Ok(new
            {
                summary = new
                {
                    totalRevenue,
                    transactions = transactionCount,
                    averageTransaction = Math.Round(averageTransaction, 2),
                    topMethod
                },
                byMethod,
                details
            });
        }
        
        /// <summary>
        /// Get bookings summary report for date range
        /// </summary>
        [HttpGet("bookings")]
        public async Task<IActionResult> GetBookingsReport(
            [FromQuery] DateTime start, 
            [FromQuery] DateTime end)
        {
            var bookings = await _context.Bookings
                .Where(b => b.BookingDate >= start && b.BookingDate <= end)
                .ToListAsync();
            
            var total = bookings.Count;
            
            // Group by status
            var byStatus = bookings
                .GroupBy(b => b.Status)
                .Select(g => new
                {
                    status = g.Key,
                    count = g.Count(),
                    percentage = total > 0 ? Math.Round((double)g.Count() / total * 100, 1) : 0
                })
                .OrderByDescending(x => x.count)
                .ToList();
            
            var summary = new
            {
                totalBookings = total,
                confirmed = bookings.Count(b => b.Status == "Confirmed"),
                checkedIn = bookings.Count(b => b.Status == "CheckedIn"),
                checkedOut = bookings.Count(b => b.Status == "CheckedOut"),
                cancelled = bookings.Count(b => b.Status == "Cancelled"),
                pending = bookings.Count(b => b.Status == "Pending")
            };
            
            return Ok(new
            {
                summary,
                details = byStatus
            });
        }
    }
}

