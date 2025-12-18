using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelAPI.Data;
using HotelAPI.DTOs;

namespace HotelAPI.Controllers
{
    /// <summary>
    /// Rooms controller - manages hotel rooms
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly HotelDbContext _context;
        
        public RoomsController(HotelDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Get all rooms
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRooms()
        {
            var rooms = await _context.Rooms
                .Include(r => r.RoomType)
                .Select(r => new RoomDto
                {
                    RoomId = r.RoomID,
                    RoomNumber = r.RoomNumber,
                    RoomTypeName = r.RoomType!.TypeName,
                    Floor = r.Floor,
                    Status = r.Status,
                    BasePrice = r.RoomType.BasePrice,
                    Capacity = r.RoomType.Capacity,
                    Description = r.Description
                })
                .ToListAsync();
            
            return Ok(rooms);
        }
        
        /// <summary>
        /// Get room by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoom(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.RoomID == id);
            
            if (room == null)
                return NotFound(new { message = "Room not found" });
            
            return Ok(new RoomDto
            {
                RoomId = room.RoomID,
                RoomNumber = room.RoomNumber,
                RoomTypeName = room.RoomType!.TypeName,
                Floor = room.Floor,
                Status = room.Status,
                BasePrice = room.RoomType.BasePrice,
                Capacity = room.RoomType.Capacity,
                Description = room.Description
            });
        }
        
        /// <summary>
        /// Get available rooms for date range
        /// </summary>
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableRooms(
            [FromQuery] DateTime checkIn, 
            [FromQuery] DateTime checkOut)
        {
            // Validate dates
            if (checkOut <= checkIn)
            {
                return BadRequest(new { message = "Check-out date must be after check-in date" });
            }
            
            // Get rooms that have bookings overlapping with requested dates
            var bookedRoomIds = await _context.Bookings
                .Where(b => b.Status != "Cancelled" && b.Status != "CheckedOut" &&
                           b.CheckInDate < checkOut &&
                           b.CheckOutDate > checkIn)
                .Select(b => b.RoomID)
                .ToListAsync();
            
            // Get available rooms
            var availableRooms = await _context.Rooms
                .Include(r => r.RoomType)
                .Where(r => r.Status == "Available" && !bookedRoomIds.Contains(r.RoomID))
                .Select(r => new RoomDto
                {
                    RoomId = r.RoomID,
                    RoomNumber = r.RoomNumber,
                    RoomTypeName = r.RoomType!.TypeName,
                    Floor = r.Floor,
                    Status = r.Status,
                    BasePrice = r.RoomType.BasePrice,
                    Capacity = r.RoomType.Capacity,
                    Description = r.Description
                })
                .ToListAsync();
            
            return Ok(availableRooms);
        }
        
        /// <summary>
        /// Get all room types
        /// </summary>
        [HttpGet("types")]
        public async Task<IActionResult> GetRoomTypes()
        {
            var roomTypes = await _context.RoomTypes
                .Select(rt => new RoomTypeDto
                {
                    RoomTypeId = rt.RoomTypeID,
                    TypeName = rt.TypeName,
                    Description = rt.Description,
                    BasePrice = rt.BasePrice,
                    Capacity = rt.Capacity
                })
                .ToListAsync();
            
            return Ok(roomTypes);
        }
    }
}

