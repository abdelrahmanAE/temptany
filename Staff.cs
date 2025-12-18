namespace HotelAPI.Models
{
    /// <summary>
    /// Staff entity - hotel employees
    /// </summary>
    public class Staff
    {
        public int StaffID { get; set; }
        public int? UserID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty; // Receptionist, Manager, Housekeeping, Maintenance
        public string? Phone { get; set; }
        public DateTime HireDate { get; set; }
        public decimal? Salary { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public User? User { get; set; }
        
        // Computed property
        public string FullName => $"{FirstName} {LastName}";
    }
}

