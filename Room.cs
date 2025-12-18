namespace HotelAPI.Models
{
    /// <summary>
    /// Room entity - individual hotel rooms
    /// </summary>
    public class Room
    {
        public int RoomID { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int RoomTypeID { get; set; }
        public int Floor { get; set; }
        public string Status { get; set; } = "Available"; // Available, Occupied, Maintenance
        public string? Description { get; set; }
        
        // Navigation property
        public RoomType? RoomType { get; set; }
    }
    
    /// <summary>
    /// RoomType entity - categories of rooms
    /// </summary>
    public class RoomType
    {
        public int RoomTypeID { get; set; }
        public string TypeName { get; set; } = string.Empty; // Single, Double, Suite, Deluxe
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
        
        // Navigation property
        public ICollection<Room>? Rooms { get; set; }
    }
}

