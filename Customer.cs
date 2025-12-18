namespace HotelAPI.Models
{
    /// <summary>
    /// Customer entity - linked to User for authentication
    /// </summary>
    public class Customer
    {
        public int CustomerID { get; set; }
        public int? UserID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? IDNumber { get; set; } // National ID or Passport
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Navigation property
        public User? User { get; set; }
        
        // Computed property
        public string FullName => $"{FirstName} {LastName}";
    }
}

