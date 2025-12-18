namespace HotelAPI.DTOs
{
    /// <summary>
    /// Room response DTO
    /// </summary>
    public class RoomDto
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
        public int Floor { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Room type response DTO
    /// </summary>
    public class RoomTypeDto
    {
        public int RoomTypeId { get; set; }
        public string TypeName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int Capacity { get; set; }
    }
}

