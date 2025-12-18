namespace HotelAPI.DTOs
{
    /// <summary>
    /// Create staff request DTO
    /// </summary>
    public class CreateStaffDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Position { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
    }
    
    /// <summary>
    /// Update staff request DTO
    /// </summary>
    public class UpdateStaffDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Position { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
    }
    
    /// <summary>
    /// Staff response DTO
    /// </summary>
    public class StaffDto
    {
        public int StaffId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public bool IsActive { get; set; }
    }
}

