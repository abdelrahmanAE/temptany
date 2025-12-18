using Microsoft.EntityFrameworkCore;
using HotelAPI.Models;

namespace HotelAPI.Data
{
    /// <summary>
    /// Database context for Hotel API
    /// </summary>
    public class HotelDbContext : DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options)
        {
        }
        
        // DbSets for all entities
        public DbSet<User> Users { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<CheckInOutLog> CheckInOutLogs { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Map entities to table names
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Customer>().ToTable("Customers");
            modelBuilder.Entity<Staff>().ToTable("Staff");
            modelBuilder.Entity<RoomType>().ToTable("RoomTypes");
            modelBuilder.Entity<Room>().ToTable("Rooms");
            modelBuilder.Entity<Booking>().ToTable("Bookings");
            modelBuilder.Entity<Payment>().ToTable("Payments");
            modelBuilder.Entity<CheckInOutLog>().ToTable("CheckInOutLog");
            
            // Configure primary keys
            modelBuilder.Entity<User>().HasKey(u => u.UserID);
            modelBuilder.Entity<Customer>().HasKey(c => c.CustomerID);
            modelBuilder.Entity<Staff>().HasKey(s => s.StaffID);
            modelBuilder.Entity<RoomType>().HasKey(rt => rt.RoomTypeID);
            modelBuilder.Entity<Room>().HasKey(r => r.RoomID);
            modelBuilder.Entity<Booking>().HasKey(b => b.BookingID);
            modelBuilder.Entity<Payment>().HasKey(p => p.PaymentID);
            modelBuilder.Entity<CheckInOutLog>().HasKey(c => c.LogID);
            
            // Configure relationships
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserID);
            
            modelBuilder.Entity<Staff>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserID);
            
            modelBuilder.Entity<Room>()
                .HasOne(r => r.RoomType)
                .WithMany(rt => rt.Rooms)
                .HasForeignKey(r => r.RoomTypeID);
            
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany()
                .HasForeignKey(b => b.CustomerID);
            
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Room)
                .WithMany()
                .HasForeignKey(b => b.RoomID);
            
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithMany()
                .HasForeignKey(p => p.BookingID);
            
            modelBuilder.Entity<CheckInOutLog>()
                .HasOne(c => c.Booking)
                .WithMany()
                .HasForeignKey(c => c.BookingID);
            
            modelBuilder.Entity<CheckInOutLog>()
                .HasOne(c => c.Staff)
                .WithMany()
                .HasForeignKey(c => c.StaffID);
            
            // Configure unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
            
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            
            modelBuilder.Entity<Room>()
                .HasIndex(r => r.RoomNumber)
                .IsUnique();
            
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.ReceiptNumber)
                .IsUnique();
        }
    }
}

