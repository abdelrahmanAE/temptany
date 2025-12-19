using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HotelAPI.Data;
using HotelAPI.Models;
using HotelAPI.DTOs;

namespace HotelAPI.Controllers
{
    /// <summary>
     /// Auth controller - de el bawaba bta3et el dakhla wel khroug (Login & Register)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly HotelDbContext _context;
        private readonly IConfiguration _configuration;
        
        public AuthController(HotelDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        
        /// <summary>
        /// hna bn-register customer gded 3ashan ykon lih account
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // law msh m-dakhal data kamla, erfa3 el cart el a7mar
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }
            
            // check law el username mawgood abl kda
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }
            
            // Check if email exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }
            
            // Create user
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Customer",
                CreatedAt = DateTime.Now,
                IsActive = true
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            // Create customer profile
            var customer = new Customer
            {
                UserID = user.UserID,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                CreatedAt = DateTime.Now
            };
            
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Registration successful" });
        }
        
        /// <summary>
        /// Login with username and password
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // Find user
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == dto.Username);
            
            // Verify credentials
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }
            
            // Check if active
            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is disabled" });
            }
            
            // Generate JWT token
            var token = GenerateJwtToken(user);
            
            // Return response
            return Ok(new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    UserId = user.UserID,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role
                }
            });
        }
        
        /// <summary>
        /// Generate JWT token for authenticated user
        /// </summary>
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSuperSecretKeyHere123456789012345678901234567890"));
            
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };
            
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

