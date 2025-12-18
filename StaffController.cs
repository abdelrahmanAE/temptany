using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HotelAPI.Data;
using HotelAPI.Models;
using HotelAPI.DTOs;

namespace HotelAPI.Controllers
{
    /// <summary>
    /// Staff controller - manages hotel staff (Admin only)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class StaffController : ControllerBase
    {
        private readonly HotelDbContext _context;
        
        public StaffController(HotelDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Get all staff members
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetStaff()
        {
            var staff = await _context.Staff
                .Include(s => s.User)
                .Select(s => new StaffDto
                {
                    StaffId = s.StaffID,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    Email = s.User != null ? s.User.Email : "",
                    Phone = s.Phone,
                    Position = s.Position,
                    HireDate = s.HireDate,
                    IsActive = s.IsActive
                })
                .ToListAsync();
            
            return Ok(staff);
        }
        
        /// <summary>
        /// Get staff member by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _context.Staff
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StaffID == id);
            
            if (staff == null)
                return NotFound(new { message = "Staff member not found" });
            
            return Ok(new StaffDto
            {
                StaffId = staff.StaffID,
                FirstName = staff.FirstName,
                LastName = staff.LastName,
                Email = staff.User?.Email ?? "",
                Phone = staff.Phone,
                Position = staff.Position,
                HireDate = staff.HireDate,
                IsActive = staff.IsActive
            });
        }
        
        /// <summary>
        /// Create new staff member
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto dto)
        {
            // Check if username exists
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }
            
            // Check if email exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }
            
            // Create user account
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Staff",
                CreatedAt = DateTime.Now,
                IsActive = true
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Create staff profile
            var staff = new Staff
            {
                UserID = user.UserID,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                Position = dto.Position,
                Salary = dto.Salary,
                HireDate = dto.HireDate,
                IsActive = true
            };
            
            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();
            
            return Ok(new 
            { 
                message = "Staff member created successfully",
                staffId = staff.StaffID
            });
        }
        
        /// <summary>
        /// Update staff member
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffDto dto)
        {
            var staff = await _context.Staff.FindAsync(id);
            
            if (staff == null)
                return NotFound(new { message = "Staff member not found" });
            
            // Update fields
            staff.FirstName = dto.FirstName;
            staff.LastName = dto.LastName;
            staff.Phone = dto.Phone;
            staff.Position = dto.Position;
            
            if (dto.Salary.HasValue)
                staff.Salary = dto.Salary;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Staff member updated successfully" });
        }
        
        /// <summary>
        /// Deactivate staff member
        /// </summary>
        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> DeactivateStaff(int id)
        {
            var staff = await _context.Staff
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StaffID == id);
            
            if (staff == null)
                return NotFound(new { message = "Staff member not found" });
            
            staff.IsActive = false;
            
            if (staff.User != null)
                staff.User.IsActive = false;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Staff member deactivated successfully" });
        }
        
        /// <summary>
        /// Activate staff member
        /// </summary>
        [HttpPut("{id}/activate")]
        public async Task<IActionResult> ActivateStaff(int id)
        {
            var staff = await _context.Staff
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StaffID == id);
            
            if (staff == null)
                return NotFound(new { message = "Staff member not found" });
            
            staff.IsActive = true;
            
            if (staff.User != null)
                staff.User.IsActive = true;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Staff member activated successfully" });
        }
    }
}

